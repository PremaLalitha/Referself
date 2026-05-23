const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Resource = require("../models/Resource");
const verifyToken = require("../middleware/authMiddleware");
const {
  uploadResource,
  getResourcesByUploader,
  updateResource,
  deleteResource,
  getSubjects, // new controller
  addComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  addRating,
  getAverageRating,
  getUserRating,
  getCommentsByUser,
  getTopRatedResources,
  downloadResource,
} = require("../controllers/resourceControllers");

const Comment = require("../models/Comment");

// Multer setup with dynamic destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subject = req.body.subject;
    const dir = path.join('uploads', subject);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload resource (Protected)
router.post("/upload", verifyToken, upload.single("file"), uploadResource);

// Get all resources (optional filter by subject, folder, user, or search)
router.get("/", async (req, res) => {
  try {
    const { subject, folderId, uploadedBy, search } = req.query;
    const matchQuery = {};
    if (subject) matchQuery.subject = subject;
    if (folderId) {
      try {
        matchQuery.folderId = new mongoose.Types.ObjectId(folderId);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid folderId' });
      }
    } else if (subject) matchQuery.folderId = null; // Only show resources not in any folder when viewing subject
    if (uploadedBy) matchQuery.uploadedBy = uploadedBy;
    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(matchQuery).populate('folderId', 'name').sort({ uploadedAt: -1 }).lean();

    // Add commentCount
    for (let res of resources) {
      const commentCount = await require('../models/Comment').countDocuments({ resource: res._id });
      res.commentCount = commentCount;
      res.folderId = res.folderId ? res.folderId.name : null;
    }
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// New route to get all distinct subjects (folders)
router.get("/subjects", getSubjects);

// Update resource (Protected)
router.put("/:id", verifyToken, updateResource);

// Delete resource (Protected)
router.delete("/:id", verifyToken, deleteResource);

// Comments
router.post("/:id/comments", verifyToken, addComment);
router.get("/:id/comments", getComments);
router.put("/:id/comments/:commentId", verifyToken, updateComment);
router.delete("/:id/comments/:commentId", verifyToken, deleteComment);
router.post("/:id/comments/:commentId/like", verifyToken, likeComment);

// Ratings
router.post("/:id/ratings", verifyToken, addRating);
router.get("/:id/rating", getAverageRating);
router.get("/:id/ratings", verifyToken, getUserRating);

// Download resource (optional auth for logging)
router.get("/:id/download", downloadResource);

// Get comments by user (Protected)
router.get("/comments/user", verifyToken, getCommentsByUser);

// Top rated resources (Public - no authentication required)
router.get("/top-liked", getTopRatedResources);

module.exports = router;
