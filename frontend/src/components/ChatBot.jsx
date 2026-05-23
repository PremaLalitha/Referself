import API_BASE from '../config/api.js';
import React, { useState } from 'react';
import '../styles/ChatBot.css';

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm the ReferSelf assistant. Ask me about using the app, like 'how to upload a resource'." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = { sender: 'bot', text: data.message };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Try to parse error body for helpful message
        let serverText = 'Sorry, something went wrong. Try again.';
        try {
          const errBody = await response.json();
          serverText = errBody.error || errBody.message || serverText;
        } catch (parseErr) {
          try {
            const text = await response.text();
            if (text) serverText = text;
          } catch (t) {
            // ignore
          }
        }
        console.error('Chat API error:', response.status, response.statusText);
        const errorMessage = { sender: 'bot', text: serverText };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = { sender: 'bot', text: 'Network error. Check if server is running.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>ReferSelf Assistant</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <span>{msg.text}</span>
          </div>
        ))}
        {isLoading && <div className="message bot">Typing...</div>}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
