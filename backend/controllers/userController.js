// controllers/userController.js
const User = require('../models/User');

exports.getUserByEmail = async (req, res) => {
  const email = req.query.email?.trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) return res.status(400).json({ error: 'Invalid email format' });

  try {
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch download count for the user
    const Download = require('../models/Download');
    const downloadCount = await Download.countDocuments({ user: user._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      dob: user.dob,
      phone: user.phone,
      institution: user.institution,
      course: user.course,
      year: user.year,
      semester: user.semester,
      subjectsOfInterest: user.subjectsOfInterest,
      notificationSettings: user.notificationSettings,
      bio: user.bio,
      profileImage: user.profileImage,
      socialLinks: user.socialLinks,
      isGoogleConnected: user.isGoogleConnected,
      uploads: user.uploads,
      preferences: user.preferences,
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      lastStreakDate: user.lastStreakDate,
      downloads: downloadCount,
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile (excluding email)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user
    const {
      name,
      dob,
      phone,
      institution,
      course,
      year,
      semester,
      subjectsOfInterest,
      notificationSettings,
      bio,
      socialLinks,
      deleteProfileImage
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (dob) updateData.dob = new Date(dob);
    if (phone !== undefined) updateData.phone = phone;
    if (institution !== undefined) updateData.institution = institution;
    if (course !== undefined) updateData.course = course;
    if (year !== undefined) updateData.year = year;
    if (semester !== undefined) updateData.semester = semester;
    if (subjectsOfInterest !== undefined) updateData.subjectsOfInterest = subjectsOfInterest;
    if (notificationSettings !== undefined) updateData.notificationSettings = notificationSettings;
    if (bio !== undefined) updateData.bio = bio;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    // Handle profile image deletion
    if (deleteProfileImage === 'true') {
      // Get current user to delete old image file
      const currentUser = await User.findById(userId);
      if (currentUser && currentUser.profileImage) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', currentUser.profileImage);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      updateData.profileImage = null;
    } else if (req.file) {
      // Handle profile image upload - delete old image first
      const currentUser = await User.findById(userId);
      if (currentUser && currentUser.profileImage) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', currentUser.profileImage);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      updateData.profileImage = req.file.path.replace(/\\/g, '/');
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.json({
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      dob: updatedUser.dob,
      phone: updatedUser.phone,
      institution: updatedUser.institution,
      course: updatedUser.course,
      year: updatedUser.year,
      semester: updatedUser.semester,
      subjectsOfInterest: updatedUser.subjectsOfInterest,
      notificationSettings: updatedUser.notificationSettings,
      bio: updatedUser.bio,
      profileImage: updatedUser.profileImage,
      socialLinks: updatedUser.socialLinks,
      isGoogleConnected: updatedUser.isGoogleConnected,
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user account
exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user comments
exports.getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    // Ensure user can only access their own comments
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const Comment = require('../models/Comment');
    const Resource = require('../models/Resource');

    const comments = await Comment.find({ user: userId })
      .populate('resource', 'title')
      .sort({ createdAt: -1 });

    const commentsWithResourceTitle = comments.map(comment => ({
      _id: comment._id,
      text: comment.comment,
      createdAt: comment.createdAt,
      resourceId: comment.resource ? comment.resource._id : null,
      resourceTitle: comment.resource ? comment.resource.title : 'Resource not found'
    }));

    res.json(commentsWithResourceTitle);
  } catch (err) {
    console.error('Error fetching user comments:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin functions
const Activity = require('../models/Activity');
const Message = require('../models/Message');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    const requestingUser = await User.findById(req.user.id);
    if (!requestingUser || requestingUser.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await User.find({}, {
      password: 0, // Exclude password
      googleId: 0 // Exclude Google ID
    }).sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Ban user (Admin only)
exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await User.findByIdAndUpdate(userId, { banned: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Log activity
    await Activity.create({
      user: adminId,
      action: 'ban_user',
      details: `Banned user: ${user.name} (${user.email})`
    });

    res.json({ message: 'User banned successfully', user });
  } catch (err) {
    console.error('Error banning user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Unban user (Admin only)
exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await User.findByIdAndUpdate(userId, { banned: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Log activity
    await Activity.create({
      user: adminId,
      action: 'unban_user',
      details: `Unbanned user: ${user.name} (${user.email})`
    });

    res.json({ message: 'User unbanned successfully', user });
  } catch (err) {
    console.error('Error unbanning user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Change user role (Admin only)
exports.changeRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;

    if (!['User', 'Admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Log activity
    await Activity.create({
      user: adminId,
      action: 'change_role',
      details: `Changed role of ${user.name} (${user.email}) to ${role}`
    });

    res.json({ message: 'User role updated successfully', user });
  } catch (err) {
    console.error('Error changing user role:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user activities (Admin only)
exports.getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const activities = await Activity.find({ user: userId })
      .populate('resource', 'title')
      .populate('subject', 'name')
      .populate('comment', 'comment')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalActivities = await Activity.countDocuments({ user: userId });

    res.json({
      activities,
      totalPages: Math.ceil(totalActivities / limit),
      currentPage: parseInt(page),
      totalActivities
    });
  } catch (err) {
    console.error('Error fetching user activities:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Send message to user (Admin only)
exports.sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subject, content } = req.body;
    const adminId = req.user.id;

    if (!subject || !content) {
      return res.status(400).json({ error: 'Subject and content are required' });
    }

    const message = await Message.create({
      sender: adminId,
      recipient: userId,
      subject: subject.trim(),
      content: content.trim()
    });

    // Log activity
    const recipient = await User.findById(userId);
    await Activity.create({
      user: adminId,
      action: 'send_message',
      details: `Sent message to ${recipient.name} (${recipient.email}): ${subject}`
    });

    res.json({ message: 'Message sent successfully', messageData: message });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user comment
exports.updateUserComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment: newCommentText } = req.body;
    const userId = req.user.id;

    const Comment = require('../models/Comment');
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to edit this comment' });
    }

    comment.comment = newCommentText;
    await comment.save();

    res.json({ message: 'Comment updated successfully', comment });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user comment
exports.deleteUserComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const Comment = require('../models/Comment');
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Warn user (Admin only)
exports.warnUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Increment warnings and update status
    const newWarnings = user.warnings + 1;
    const newStatus = newWarnings >= 3 ? 'removed' : 'warned';

    await User.findByIdAndUpdate(userId, {
      warnings: newWarnings,
      status: newStatus
    });

    // Send warning email
    const { sendEmail } = require('../utils/sendEmail');
    const { warningEmailTemplate } = require('../utils/emailTemplates');

    await sendEmail({
      to: user.email,
      subject: `Account Warning ${newWarnings} - ReferShelf`,
      html: warningEmailTemplate(user.name, newWarnings)
    });

    // Log activity
    await Activity.create({
      user: adminId,
      action: 'warn_user',
      details: `Warned user: ${user.name} (${user.email}) - Warning ${newWarnings}`
    });

    // If user reached 3 warnings, also remove them
    if (newWarnings >= 3) {
      // Send removal email
      const { removalEmailTemplate } = require('../utils/emailTemplates');
      await sendEmail({
        to: user.email,
        subject: 'Account Removal - ReferShelf',
        html: removalEmailTemplate(user.name)
      });

      await Activity.create({
        user: adminId,
        action: 'remove_user',
        details: `Automatically removed user after 3 warnings: ${user.name} (${user.email})`
      });
    }

    res.json({
      message: newWarnings >= 3 ? 'User warned and automatically removed after 3 warnings' : 'User warned successfully',
      user: { ...user.toObject(), warnings: newWarnings, status: newStatus }
    });
  } catch (err) {
    console.error('Error warning user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove user (Admin only)
exports.removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update user status to removed
    await User.findByIdAndUpdate(userId, { status: 'removed' });

    // Send removal email
    const { sendEmail } = require('../utils/sendEmail');
    const { removalEmailTemplate } = require('../utils/emailTemplates');

    await sendEmail({
      to: user.email,
      subject: 'Account Removal - ReferShelf',
      html: removalEmailTemplate(user.name)
    });

    // Log activity
    await Activity.create({
      user: adminId,
      action: 'remove_user',
      details: `Removed user: ${user.name} (${user.email})`
    });

    res.json({
      message: 'User removed successfully',
      user: { ...user.toObject(), status: 'removed' }
    });
  } catch (err) {
    console.error('Error removing user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
