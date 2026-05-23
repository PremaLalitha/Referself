const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  createFolder,
  getFoldersBySubject,
  updateFolder,
  deleteFolder,
} = require("../controllers/folderControllers");

// Create folder (Protected)
router.post("/create", verifyToken, createFolder);

// Get folders by subject
router.get("/subject/:subjectId", getFoldersBySubject);

// Update folder (Protected)
router.put("/:id", verifyToken, updateFolder);

// Delete folder (Protected)
router.delete("/:id", verifyToken, deleteFolder);

module.exports = router;
