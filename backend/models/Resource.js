const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  subject: { type: String, required: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: false },
  fileType: {
    type: String,
    enum: ["File", "Link", "PDF", "DOCX", "XLSX", "PPTX", "TXT", "JPG", "PNG", "ZIP", "RAR"],
    required: true,
  },
  uploadedBy: { type: String, required: true },
  filePath: { type: String, default: "" },
  fileName: { type: String, default: "" },
  externalLink: { type: String, default: "" },
  textContent: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now },
  likesCount: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
});

module.exports = mongoose.model("Resource", resourceSchema);