const Resource = require('../models/Resource');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const Activity = require('../models/Activity');
const User = require('../models/User');
const fs = require('fs');

// Upload new resource
exports.uploadResource = async (req, res) => {
  try {
    const { title, course, subject, folderId, fileType, externalLink, textContent, uploadedBy } = req.body;

    if (!title || !course || !subject || !fileType || !uploadedBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (fileType === 'Link' && !externalLink) {
      return res.status(400).json({ error: 'External link is required' });
    }



    if (fileType === 'File' && !req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const newResource = new Resource({
      title,
      course,
      subject,
      folderId,
      fileType,
      uploadedBy,
      externalLink: fileType === 'Link' ? externalLink : '',

      filePath: fileType === 'File' && req.file ? req.file.path : '',
      fileName: fileType === 'File' && req.file ? req.file.originalname : '',
    });

    const saved = await newResource.save();

    // Award 1 coin for upload
    await User.findByIdAndUpdate(req.user.id, { $inc: { coins: 1 } });

    // Log activity
    await Activity.create({
      user: req.user.id,
      action: 'upload',
      resource: saved._id,
      details: `Uploaded resource: ${saved.title}`
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get resources (optional filter by uploader)
exports.getResourcesByUploader = async (req, res) => {
  try {
    const filter = req.query.uploadedBy ? { uploadedBy: req.query.uploadedBy } : {};
    const resources = await Resource.find(filter).sort({ uploadedAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Update resource
exports.updateResource = async (req, res) => {
  try {
    const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Resource not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Delete resource
exports.deleteResource = async (req, res) => {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Resource not found' });

    // Delete file from uploads folder if it exists
    if (deleted.filePath && fs.existsSync(deleted.filePath)) {
      fs.unlinkSync(deleted.filePath);
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// New controller to get all subjects from Subject model
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await require('../models/Subject').find().sort({ createdAt: -1 });
    res.json(subjects.map(s => s.name));
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { comment, parentComment } = req.body;
    const resourceId = req.params.id;
    const userId = req.user.id;

    const newComment = new Comment({
      user: userId,
      resource: resourceId,
      comment,
      parentComment: parentComment || null,
    });

    await newComment.save();

    // Log activity
    await Activity.create({
      user: userId,
      action: 'comment',
      resource: resourceId,
      comment: newComment._id,
      details: `Commented on resource: ${comment.substring(0, 50)}...`
    });

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get comments for a resource (flattened list including replies)
exports.getComments = async (req, res) => {
  try {
    const buildCommentTree = async (parentId, depth = 0) => {
      const comments = await Comment.find({ resource: req.params.id, parentComment: parentId }).populate('user', '_id name').select('user comment createdAt likes likesCount').sort({ createdAt: parentId ? 1 : -1 });
      let flattened = [];
      for (let comment of comments) {
        comment.depth = depth; // Add depth for indentation if needed
        flattened.push(comment);
        const replies = await buildCommentTree(comment._id, depth + 1);
        flattened = flattened.concat(replies);
      }
      return flattened;
    };
    const comments = await buildCommentTree(null);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { id: resourceId, commentId } = req.params;
    const { comment: newCommentText } = req.body;
    const comment = await Comment.findById(commentId).populate('user', '_id');
    if (!comment || comment.resource.toString() !== resourceId) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    // Allow admin to edit any comment, or user to edit their own
    if (req.user.role !== 'Admin' && comment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this comment' });
    }
    comment.comment = newCommentText;
    await comment.save();
    res.json({ message: 'Comment updated successfully', comment });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id: resourceId, commentId } = req.params;
    const comment = await Comment.findById(commentId).populate('user', '_id');
    if (!comment || comment.resource.toString() !== resourceId) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    // Allow admin to delete any comment, or user to delete their own
    if (req.user.role !== 'Admin' && comment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }
    await Comment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Like or unlike a comment
exports.likeComment = async (req, res) => {
  try {
    const { id: resourceId, commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment || comment.resource.toString() !== resourceId) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userIndex = comment.likes.indexOf(userId);
    if (userIndex > -1) {
      // Unlike: remove user from likes
      comment.likes.splice(userIndex, 1);
      comment.likesCount -= 1;
    } else {
      // Like: add user to likes
      comment.likes.push(userId);
      comment.likesCount += 1;
    }

    await comment.save();

    // Log activity
    await Activity.create({
      user: userId,
      action: 'like_comment',
      resource: resourceId,
      comment: commentId,
      details: `Liked comment: ${comment.comment.substring(0, 50)}...`
    });

    res.json({ likesCount: comment.likesCount, liked: userIndex === -1 });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Add or update rating (1-5 stars)
exports.addRating = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user already rated
    let existing = await Rating.findOne({ user: userId, resource: resourceId });
    if (existing) {
      // Update existing rating
      existing.rating = rating;
      await existing.save();
    } else {
      // Create new rating
      const newRating = new Rating({
        user: userId,
        resource: resourceId,
        rating,
      });
      await newRating.save();
    }

    // Calculate average rating
    const ratings = await Rating.find({ resource: resourceId });
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

    // Update resource with average rating (store as likesCount for compatibility, but it's now average)
    await Resource.findByIdAndUpdate(resourceId, { likesCount: averageRating });

    // Log activity
    await Activity.create({
      user: userId,
      action: 'rate',
      resource: resourceId,
      details: `Rated resource ${rating} stars`
    });

    res.status(201).json({ rating, averageRating });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get average rating
exports.getAverageRating = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({ averageRating: resource.likesCount });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get user rating for a resource
exports.getUserRating = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;
    const rating = await Rating.findOne({ user: userId, resource: resourceId });
    res.json({ userRating: rating ? rating.rating : null });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Download resource
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Increment total downloads
    resource.downloads = (resource.downloads || 0) + 1;
    await resource.save();

    // Log user-specific download if authenticated
    if (req.user) {
      try {
        const Download = require('../models/Download');
        const newDownload = new Download({
          user: req.user.id,
          resource: resource._id,
        });
        await newDownload.save();

        // Log activity
        await Activity.create({
          user: req.user.id,
          action: 'download',
          resource: resource._id,
          details: `Downloaded resource: ${resource.title}`
        });
      } catch (logErr) {
        console.error('Error logging download:', logErr);
        // Continue without failing the download
      }
    }

    // Serve file, return URL for links, text content, or error
    if (resource.fileType === 'Link' && resource.externalLink) {
      res.json({ url: resource.externalLink });
    } else if (resource.filePath) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.resolve(resource.filePath); // Ensure absolute path
      if (fs.existsSync(filePath)) {
        const isView = req.query.view === 'true';
        if (isView) {
          res.setHeader('Content-Disposition', 'inline');
          res.sendFile(filePath, (err) => {
            if (err) {
              console.error('Error serving file for view:', err);
              res.status(500).json({ error: 'Error serving file' });
            }
          });
        } else {
          res.download(filePath, resource.fileName || resource.title, (err) => {
            if (err) {
              console.error('Error downloading file:', err);
              res.status(500).json({ error: 'Error downloading file' });
            }
          });
        }
      } else {
        console.error('File not found at path:', filePath);
        res.status(404).json({ error: 'File not found' });
      }
    } else {
      res.status(400).json({ error: 'No file, link, or text available' });
    }
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get comments by user
exports.getCommentsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const comments = await Comment.find({ user: userId }).populate('resource', 'title').populate('user', 'name').sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get top liked resources
exports.getTopRatedResources = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'folders',
          localField: 'folderId',
          foreignField: '_id',
          as: 'folder'
        }
      },
      {
        $addFields: {
          folderName: { $arrayElemAt: ['$folder.name', 0] }
        }
      },
      {
        $project: {
          title: 1,
          course: 1,
          subject: 1,
          folderId: { $ifNull: ['$folderName', null] },
          fileType: 1,
          uploadedBy: 1,
          uploadedAt: 1,
          likesCount: 1,
          downloads: 1,
          externalLink: 1,
          _id: 1
        }
      },
      { $sort: { likesCount: -1 } },
      { $limit: 10 }
    ];

    const resources = await Resource.aggregate(pipeline);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
