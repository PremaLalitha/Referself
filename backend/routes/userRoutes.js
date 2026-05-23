const express = require('express');
const router = express.Router();
const multer = require('multer');
const resourceController = require('../controllers/resourceControllers');
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// Admin middleware to check if user is admin
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user.id);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('Admin verification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

router.post('/upload', verifyToken, upload.single('file'), resourceController.uploadResource);
router.get('/resources', resourceController.getResourcesByUploader);
router.put('/resources/:id', verifyToken, resourceController.updateResource);
router.delete('/resources/:id', verifyToken, resourceController.deleteResource);

// User profile routes
router.get('/', userController.getUserByEmail);
router.put('/profile', verifyToken, upload.single('profileImage'), userController.updateUserProfile);

router.delete('/account', verifyToken, userController.deleteUserAccount);
router.get('/comments/:userId', verifyToken, userController.getUserComments);

// Admin user management routes
router.get('/admin/users', verifyToken, verifyAdmin, userController.getAllUsers);
router.put('/admin/users/:userId/ban', verifyToken, verifyAdmin, userController.banUser);
router.put('/admin/users/:userId/unban', verifyToken, verifyAdmin, userController.unbanUser);
router.put('/admin/users/:userId/role', verifyToken, verifyAdmin, userController.changeRole);
router.post('/admin/users/:userId/warn', verifyToken, verifyAdmin, userController.warnUser);
router.post('/admin/users/:userId/remove', verifyToken, verifyAdmin, userController.removeUser);
router.get('/admin/users/:userId/activities', verifyToken, verifyAdmin, userController.getUserActivities);
router.post('/admin/users/:userId/message', verifyToken, verifyAdmin, userController.sendMessage);

// Comment management for users
router.put('/comments/:commentId', verifyToken, userController.updateUserComment);
router.delete('/comments/:commentId', verifyToken, userController.deleteUserComment);

module.exports = router;
