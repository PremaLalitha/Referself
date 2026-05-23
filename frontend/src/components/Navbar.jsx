import API_BASE from '../config/api.js';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import '../styles/Navbar.css'; // Correct path from components/ to styles/

const Navbar = ({ searchTerm, setSearchTerm, showSearchAndUpload = false }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const userProfileImage = localStorage.getItem('userProfileImage');
  const userCoins = localStorage.getItem('coins') || localStorage.getItem('userCoins');
  const currentStreak = localStorage.getItem('currentStreak');
  const maxStreak = localStorage.getItem('maxStreak');

  const welcomeMsg = token ? `Welcome, ${userName || 'User'}` : 'Welcome to ReferShelf';

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">ReferShelf</div>
        {showSearchAndUpload && (
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        )}
      </div>
      <ul className="nav-list">
        <li>
          <Link to="/home" className="nav-link">Home</Link>
        </li>
        <li>
          <Link to="/explore" className="nav-link">Explore</Link>
        </li>
        <li>
          <Link to="/upload" className="nav-link">Upload</Link>
        </li>
        <li>
          <Link to="/subject" className="nav-link">Folder</Link>
        </li>
        <li>
          <Link to="/myuploads" className="nav-link">My Uploads</Link>
        </li>

      </ul>
      <div className="navbar-right">
        <button onClick={toggleTheme} className="theme-toggle">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button className="welcome-msg">{welcomeMsg}</button>
        {token && (
          <>
            <div className="streak-info-navbar">
              🔥 {currentStreak || 0} days
            </div>
            <div className="coins-display">
              🪙 {userCoins || 0}
            </div>
            <Link to="/profile" className="profile-link">
              {userProfileImage ? (
                <img src={`${API_BASE}/${userProfileImage}`} alt="Profile" className="navbar-profile-photo" />
              ) : (
                <div className="navbar-profile-placeholder">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
