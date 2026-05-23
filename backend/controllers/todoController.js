const Todo = require('../models/Todo');

// Get all todos for a user
exports.getTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const todos = await Todo.find({ user: userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new todo
exports.createTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Todo text is required' });
    }

    const todo = new Todo({
      user: userId,
      text: text.trim(),
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a todo
exports.updateTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { text, completed } = req.body;

    const todo = await Todo.findOne({ _id: id, user: userId });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (text !== undefined) {
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Todo text cannot be empty' });
      }
      todo.text = text.trim();
    }

    if (completed !== undefined) {
      todo.completed = completed;
    }

    todo.updatedAt = new Date();
    await todo.save();

    res.json(todo);
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({ _id: id, user: userId });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
