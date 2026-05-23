import API_BASE from '../config/api.js';
import React, { useState, useEffect, useRef } from 'react';
import '../styles/SubjectChat.css';

function SubjectChat({ subjectId, subjectName, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/subject-chat/${subjectId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/subject-chat/${subjectId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        scrollToBottom();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE}/api/subject-chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message');
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchMessages();
    }
  }, [subjectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) {
    return (
      <div className="subject-chat">
        <h3>Subject Chat - {subjectName}</h3>
        <p>Please log in to participate in the discussion.</p>
      </div>
    );
  }

  return (
    <div className="subject-chat">
      <h3>Subject Chat - {subjectName}</h3>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the discussion!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`chat-message ${msg.userId._id === user.id ? 'own-message' : ''}`}>
              <div className="message-header">
                <strong>{msg.userName}</strong>
                <small>{new Date(msg.createdAt).toLocaleString()}</small>
                {user.role === 'admin' && (
                  <button
                    onClick={() => deleteMessage(msg._id)}
                    className="delete-message-btn"
                    title="Delete message (Admin only)"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <p>{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newMessage.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default SubjectChat;
