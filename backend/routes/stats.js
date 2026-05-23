const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Resource = require("../models/Resource");
const Download = require("../models/Download");
const Activity = require("../models/Activity");
const Subject = require("../models/Subject");
const Comment = require("../models/Comment");

router.get("/", async (req, res) => {
  try {
    const users = await User.countDocuments();
    const uploadedResources = await Resource.countDocuments();
    const downloadResult = await Resource.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const downloads = downloadResult.length > 0 ? downloadResult[0].total : 0;
    const subjects = await Subject.countDocuments();
    const comments = await Comment.countDocuments();
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }); // Last 30 days
    const recentUploads = await Resource.countDocuments({ uploadedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }); // Last 7 days

    res.json({
      users,
      resources: uploadedResources,
      downloads,
      subjects,
      comments,
      activeUsers,
      recentUploads
    });
  } catch (err) {
    console.error("Error in /api/stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Get resource distribution by subject
router.get("/resource-distribution", async (req, res) => {
  try {
    const distribution = await Resource.aggregate([
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: 'name',
          as: 'subjectInfo'
        }
      },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          subjectName: { $first: { $arrayElemAt: ['$subjectInfo.name', 0] } }
        }
      },
      {
        $project: {
          subject: { $ifNull: ['$_id', 'No Subject'] },
          count: 1,
          subjectName: { $ifNull: ['$subjectName', '$_id'] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(distribution);
  } catch (err) {
    console.error("Error in /api/stats/resource-distribution:", err);
    res.status(500).json({ error: "Failed to fetch resource distribution" });
  }
});

// Get top-rated resources
router.get("/top-rated", async (req, res) => {
  try {
    const topRated = await Resource.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: 'email',
          as: 'uploader'
        }
      },
      {
        $addFields: {
          uploaderName: { $arrayElemAt: ['$uploader.name', 0] }
        }
      },
      {
        $project: {
          title: 1,
          likesCount: 1,
          subject: 1,
          fileType: 1,
          downloads: 1,
          uploadedBy: 1,
          uploaderName: 1
        }
      },
      { $sort: { likesCount: -1 } },
      { $limit: 10 }
    ]);

    res.json(topRated);
  } catch (err) {
    console.error("Error in /api/stats/top-rated:", err);
    res.status(500).json({ error: "Failed to fetch top-rated resources" });
  }
});

// Get activities for admin
router.get("/activities", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const activities = await Activity.find()
      .populate('user', 'name email createdAt')
      .populate('resource', 'title')
      .populate('subject', 'name')
      .populate('comment', 'comment')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments();

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error("Error in /api/stats/activities:", err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

module.exports = router;
