const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['upload', 'download', 'rate', 'comment', 'delete_resource', 'delete_comment', 'create_subject', 'update_subject', 'delete_subject', 'ban_user', 'unban_user', 'change_role', 'send_message']
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  details: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);
