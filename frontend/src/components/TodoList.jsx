import API_BASE from '../config/api.js';
import { useState, useEffect } from 'react';
import '../styles/HomePage.css';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Load todos from backend on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/todos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/api/todos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newTodo.trim() }),
        });
        if (response.ok) {
          const newTodoItem = await response.json();
          setTodos([...todos, newTodoItem]);
          setNewTodo('');
        }
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const deleteTodo = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setTodos(todos.filter(todo => todo._id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(t => t._id === id ? updatedTodo : t));
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = async () => {
    if (editingText.trim()) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/api/todos/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ text: editingText.trim() }),
        });
        if (response.ok) {
          const updatedTodo = await response.json();
          setTodos(todos.map(todo => todo._id === editingId ? updatedTodo : todo));
          setEditingId(null);
          setEditingText('');
        }
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape' && editingId) {
      cancelEdit();
    }
  };

  return (
    <div className="todo-list">
      <h3>Todo List</h3>
      <div className="todo-input-section">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, addTodo)}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button onClick={addTodo} className="add-todo-btn">Add</button>
      </div>
      <div className="todo-items">
        {todos.length === 0 ? (
          <p className="no-todos">No tasks yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              {editingId === todo._id ? (
                <div className="edit-section">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo._id)}
                    className="todo-checkbox"
                  />
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                    className="edit-input"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="save-btn">Save</button>
                  <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="todo-left">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo._id)}
                      className="todo-checkbox"
                    />
                    <span className="todo-text">{todo.text}</span>
                  </div>
                  <div className="todo-actions">
                    <button onClick={() => startEditing(todo._id, todo.text)} className="edit-btn">Edit</button>
                    <button onClick={() => deleteTodo(todo._id)} className="delete-btn">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodoList;
