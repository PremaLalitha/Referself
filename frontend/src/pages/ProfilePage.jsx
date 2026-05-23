import API_BASE from '../config/api.js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userBio, setUserBio] = useState('');
  const [joinedDate, setJoinedDate] = useState('');
  const [userUploads, setUserUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStats, setUserStats] = useState({uploads: 0, downloads: 0, coins: 0, currentStreak: 0, maxStreak: 0});

  const [showEditModal, setShowEditModal] = useState(false);
  const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfileImage, setEditProfileImage] = useState(null);
  const [editProfileImagePreview, setEditProfileImagePreview] = useState('');
  const [deleteProfileImage, setDeleteProfileImage] = useState(false);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');

    if (!name || !email || !role) {
      navigate('/login');
    } else {
      setUserName(name);
      setUserEmail(email);
      setUserRole(role);

      const fetchUserDetails = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch(`${API_BASE}/api/users?email=${email}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (res.ok) {
            setUserBio(data.bio || '');
            setEditName(data.name || '');
            setEditBio(data.bio || '');
            const createdDate = new Date(data.createdAt);
            const now = new Date();
            setJoinedDate(createdDate > now ? 'Recently joined' : createdDate.toLocaleDateString());
            localStorage.setItem('userName', data.name || '');
            localStorage.setItem('coins', data.coins || 0);
            localStorage.setItem('currentStreak', data.currentStreak || 0);
            localStorage.setItem('maxStreak', data.maxStreak || 0);
            setUserStats(prev => ({...prev, downloads: data.downloads || 0, coins: data.coins || 0, currentStreak: data.currentStreak || 0, maxStreak: data.maxStreak || 0}));

            // Fetch user uploads
            const uploadsRes = await fetch(`${API_BASE}/api/resources?userId=${data._id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (uploadsRes.ok) {
              const uploadsData = await uploadsRes.json();
              setUserUploads(uploadsData);
              setFilteredUploads(uploadsData);
              setUserStats(prev => ({...prev, uploads: uploadsData.length}));
            }
          }
        } catch (err) {
          console.error('Error fetching user details:', err);
        }
      };

      fetchUserDetails();
    }
  }, [navigate, userEmail]);

  useEffect(() => {
    setFilteredUploads(userUploads.filter(u => u.title.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, userUploads]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password-send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('OTP sent to your email');
        setShowResetForm(true);
      } else {
        setMessage(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setMessage('Server error');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setMessage('Please enter OTP and new password');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Password reset successful!');
        setOtp('');
        setNewPassword('');
        setShowResetForm(false);
      } else {
        setMessage(data.message || 'Reset failed');
      }
    } catch (err) {
      setMessage('Server error');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage('Please type "DELETE" to confirm');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/users/account`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.clear();
        navigate('/login');
      } else {
        setMessage(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setMessage('Server error');
    }
    setLoading(false);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setEditProfileImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('bio', editBio);
      if (editProfileImage) {
        formData.append('profileImage', editProfileImage);
      }
      if (deleteProfileImage) {
        formData.append('deleteProfileImage', 'true');
      }

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUserName(data.name);
        setUserBio(data.bio || '');
        setEditName(data.name); // Ensure editName is also updated
        setEditBio(data.bio || ''); // Ensure editBio is also updated
        setShowEditModal(false);
        setEditProfileImage(null);
        setEditProfileImagePreview('');
        setDeleteProfileImage(false);
        setMessage('Profile updated successfully!');
        localStorage.setItem('userName', data.name);
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('Server error');
    }
    setLoading(false);
  };

  const handleDeleteUpload = async (id) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/resources/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setUserUploads(userUploads.filter(u => u._id !== id));
        setFilteredUploads(filteredUploads.filter(u => u._id !== id));
        setUserStats(prev => ({...prev, uploads: prev.uploads - 1}));
      }
    } catch (err) {
      console.error('Error deleting upload:', err);
    }
  };

  const handleSendContactMessage = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Message sent successfully!');
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setShowContactForm(false);
      } else {
        setMessage(data.message || 'Failed to send message');
      }
    } catch (err) {
      setMessage('Server error');
    }
    setLoading(false);
  };

  return (
    <div className="profile-container">
      <div className="sidebar">
        <button onClick={() => navigate('/home')}>Home</button>
        <button onClick={() => navigate('/about')}>About</button>
        <button onClick={() => setShowEditModal(true)}>Edit Profile</button>
        <button onClick={() => navigate('/comments')}>My Comments</button>
        <button onClick={() => handleSendOtp()} disabled={loading}>
          {loading ? 'Sending...' : 'Reset Password'}
        </button>
        <button onClick={() => setShowContactForm(true)}>Contact Us</button>
        <button onClick={() => setShowDeleteConfirm(true)} className="delete-account-btn">
          Delete Account
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="main-content">
        <h1>Profile</h1>
        <div className="profile-view">
          <div className="profile-header">
            <div className="profile-image-container">
              <div className="profile-image-placeholder">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-info">
              <p><strong>Name:</strong> {userName}</p>
              <p><strong>Email:</strong> {userEmail}</p>
              <p><strong>Role:</strong> {userRole}</p>
              <p><strong>Bio:</strong> {userBio || 'No bio set'}</p>
              <p><strong>Joined:</strong> {joinedDate}</p>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <p className="stat-number">{userStats.uploads}</p>
            <p className="stat-label">Uploads</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{userStats.downloads}</p>
            <p className="stat-label">Downloads</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{userStats.coins}</p>
            <p className="stat-label">Coins</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{userStats.currentStreak}</p>
            <p className="stat-label">Current Streak</p>
          </div>


        </div>



        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Profile</h2>
              <div className="profile-image-upload">
                <label>Profile Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
                {editProfileImagePreview && (
                  <img src={editProfileImagePreview} alt="Preview" className="image-preview" />
                )}
              </div>
              <label>
                Name:
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </label>
              <label>
                Bio:
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Enter bio"
                />
              </label>
              <div className="button-group">
                <button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showResetForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Reset Password</h2>
              <form onSubmit={handleResetPassword}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <div className="button-group">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button onClick={() => setShowResetForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showContactForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Contact Us</h2>
              <p>We'd love to hear from you! Reach out for support, feedback, or inquiries.</p>
              <p><strong>Email:</strong> referself08@gmail.com</p>
              <p><strong>Phone:</strong> 9894538632</p>
              <p><strong>Address:</strong> Thoothukudi</p>
              <form onSubmit={handleSendContactMessage}>
                <label>
                  Your Name:
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Your Email:
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Your Message:
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Send Message"
                    required
                  />
                </label>
                <div className="button-group">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                  <button onClick={() => setShowContactForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Delete Account</h2>
              <p>This action cannot be undone. All your data will be permanently deleted.</p>
              <p>Type "DELETE" to confirm:</p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
              />
              <div className="button-group">
                <button onClick={handleDeleteAccount} disabled={loading} className="delete-btn">
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
      </div>
    </div>
  );
}

export default ProfilePage;
