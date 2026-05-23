const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectControllers");

// Create subject (Protected, Admin only)
router.post("/", verifyToken, (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, createSubject);

// Get all subjects (Public)
router.get("/", getSubjects);

// Update subject (Protected, Admin only)
router.put("/:id", verifyToken, (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, updateSubject);

// Delete subject (Protected, Admin only)
router.delete("/:id", verifyToken, (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, deleteSubject);

module.exports = router;
