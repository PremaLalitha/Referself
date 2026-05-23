const Folder = require('../models/Folder');

// Create new folder
exports.createFolder = async (req, res) => {
  try {
    const { name, subjectId } = req.body;

    if (!name || !subjectId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newFolder = new Folder({
      name,
      subjectId,
      createdBy: req.user.email,
    });

    const saved = await newFolder.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create folder error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Get folders by subject
exports.getFoldersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const folders = await Folder.find({ subjectId }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Update folder
exports.updateFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    if (folder.createdBy !== req.user.email) return res.status(403).json({ error: 'Not authorized' });

    const updated = await Folder.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Delete folder
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ error: 'Folder not found' });
    if (folder.createdBy !== req.user.email) return res.status(403).json({ error: 'Not authorized' });

    await Folder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Folder deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
