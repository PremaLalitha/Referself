const express = require('express');
const router = express.Router();
const { getMessages, postMessage, deleteMessage } = require('../controllers/subjectChatController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all messages for a subject
router.get('/:subjectId/messages', authMiddleware, getMessages);

// Post a new message to a subject
router.post('/:subjectId/messages', authMiddleware, postMessage);

// Delete a message (admin only)
router.delete('/messages/:messageId', authMiddleware, deleteMessage);

module.exports = router;
