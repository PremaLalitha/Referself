const Subject = require('../models/Subject');

// Create a new subject (Admin only)
exports.createSubject = async (req, res) => {
  try {
    const { name, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ error: 'Name and createdBy are required' });
    }

    const existing = await Subject.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Subject already exists' });
    }

    const newSubject = new Subject({
      name: name.trim(),
      createdBy,
    });

    const saved = await newSubject.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create subject error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Update a subject (Admin only)
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const trimmedName = name.trim();
    const existing = await Subject.findOne({ 
      name: trimmedName, 
      _id: { $ne: id } 
    });
    if (existing) {
      return res.status(400).json({ error: 'Subject name already exists' });
    }

    subject.name = trimmedName;
    if (subject.updatedAt) {
      subject.updatedAt = new Date();
    }
    const updated = await subject.save();
    res.json(updated);
  } catch (err) {
    console.error('Update subject error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

// Delete a subject (Admin only)
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully', deleted: subject });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
