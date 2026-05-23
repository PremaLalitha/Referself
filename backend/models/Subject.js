const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true }, // admin email
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subject", subjectSchema);
