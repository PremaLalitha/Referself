const SubjectMessage = require('../models/SubjectMessage');
const User = require('../models/User');

// Get all messages for a subject
const getMessages = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const messages = await SubjectMessage.find({ subjectId })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Post a new message to a subject
const postMessage = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newMessage = new SubjectMessage({
      subjectId,
      userId,
      userName: user.name,
      message: message.trim(),
    });

    await newMessage.save();
    const populatedMessage = await SubjectMessage.findById(newMessage._id)
      .populate('userId', 'name email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a message (admin only)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete messages' });
    }

    const message = await SubjectMessage.findByIdAndDelete(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getMessages, postMessage, deleteMessage };
