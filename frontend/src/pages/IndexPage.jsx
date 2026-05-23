import API_BASE from '../config/api.js';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStats } from "../contexts/StatsContext.jsx";
import "../styles/IndexPage.css";
import referShelfImage from "../assets/Rs1.png";

// Data for dynamic sections
const featuresData = [
  { title: "Easy Resource Sharing", description: "Upload, share, and access educational resources seamlessly." },
  { title: "Collaborative Learning", description: "Engage with peers and experts in your field." },
  { title: "Analytics & Tracking", description: "Track downloads, usage, and engagement statistics." },
];

const userRoles = [
  { role: "User", description: "Access, upload, and download resources freely." },
  { role: "Admin", description: "Manage the platform, moderate content, and oversee users." },
];

const supportedFormats = ["PDF", "DOCX", "PPT", "Images", "External Links"];

function IndexPage() {
  const navigate = useNavigate();
  const { stats } = useStats();

  const [isVisible, setIsVisible] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) { // Show footer after scrolling 100px
        setShowFooter(true);
      } else {
        setShowFooter(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        e.target.reset();
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className={`hero ${isVisible ? "visible" : ""}`}>
        <div className="hero-content">
          <div className="hero-left">
            <h2>Refer Shelf</h2>
            <h3>Empowering Students and Educators</h3>
            <p>
              Access and share educational resources seamlessly. Join a growing
              community of learners and experts.
            </p>
            <div className="stats">
              <div>
                <strong>{stats.users}</strong> Users
              </div>
              <div>
                <strong>{stats.resources}</strong> Uploaded
              </div>
            </div>
            <button className="get-started-btn" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
          <div className="hero-right">
            <img src={referShelfImage} alt="Refer Shelf Illustration" className="hero-image" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h3>Platform Features</h3>
        <div className="feature-list">
          {featuresData.map((feature, index) => (
            <div key={index} className="feature-card">
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* User Roles Section */}
      <section className="roles">
        <h3>User Roles</h3>
        <div className="role-list">
          {userRoles.map((role, index) => (
            <div key={index} className="role-card">
              <h4>{role.role}</h4>
              <p>{role.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Formats Section */}
      <section className="formats">
        <h3>Supported Resource Formats</h3>
        <ul>
          {supportedFormats.map((format, index) => (
            <li key={index}>{format}</li>
          ))}
        </ul>
      </section>

      {/* Security & Performance Section */}
      <section className="security">
        <h3>Security & Performance</h3>
        <p>
          We ensure secure uploads, data privacy, and optimized performance for
          seamless user experience.
        </p>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2>Contact Us</h2>
        <p>We'd love to hear from you! Reach out for support, feedback, or inquiries.</p>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Email</h3>
            <p>referself08@gmail.com</p>
          </div>
          <div className="contact-item">
            <h3>Phone</h3>
            <p>9894538632</p>
          </div>
          <div className="contact-item">
            <h3>Address</h3>
            <p>Thoothukudi</p>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>

      
    </div>
  );
}

export default IndexPage;
