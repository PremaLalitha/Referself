import API_BASE from '../config/api.js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, resources: 0, downloads: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userActivities, setUserActivities] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');

    // Redirect if not admin
    if (userRole !== 'Admin') {
      alert('Access denied. Admin only.');
      navigate('/home');
      return;
    }

    fetchDashboardData();
    fetchAllUsers();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_BASE}/api/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch all resources
      const resourcesRes = await fetch(`${API_BASE}/api/resources`);
      const resourcesData = await resourcesRes.json();
      setResources(resourcesData);

      // Fetch subjects
      const subjectsRes = await fetch(`${API_BASE}/api/subjects`);
      const subjectsData = await subjectsRes.json();
      setSubjects(subjectsData);

      // Fetch activities
      await fetchActivities(currentPage);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const fetchActivities = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/stats/activities?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setActivities(data.activities);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setAllUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };



  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        alert('Resource deleted successfully');
        fetchDashboardData();
      } else {
        alert('Failed to delete resource');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Server error');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) {
      alert('Subject name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/subjects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newSubject.trim(), createdBy: localStorage.getItem('userEmail') }),
      });

      if (res.ok) {
        alert('Subject created successfully');
        setNewSubject('');
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create subject');
      }
    } catch (err) {
      console.error('Create subject error:', err);
      alert('Server error');
    }
  };

  const handleEditSubject = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleUpdateSubject = async (id) => {
    if (!editName.trim()) {
      alert('Subject name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/subjects/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (res.ok) {
        alert('Subject updated successfully');
        setEditingId(null);
        setEditName('');
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update subject');
      }
    } catch (err) {
      console.error('Update subject error:', err);
      alert('Server error');
    }
  };

  const handleDeleteSubject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the subject "${name}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/subjects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        alert('Subject deleted successfully');
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete subject');
      }
    } catch (err) {
      console.error('Delete subject error:', err);
      alert('Server error');
    }
  };

  const openModal = async (id) => {
    setSelectedResourceId(id);
    try {
      const res = await fetch(`${API_BASE}/api/resources/${id}/comments`);
      const data = await res.json();
      setComments(data);
      // Update the comment count in the resources list to match the fetched comments
      setResources(prevResources =>
        prevResources.map(resource =>
          resource._id === id ? { ...resource, commentCount: data.length } : resource
        )
      );
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching comments:', err);
      alert('Failed to load comments');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setComments([]);
    setSelectedResourceId(null);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/resources/${selectedResourceId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        // Remove the comment from the local state immediately
        setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
        // Update the comment count in the resources list
        setResources(prevResources =>
          prevResources.map(resource =>
            resource._id === selectedResourceId ? { ...resource, commentCount: (resource.commentCount || 0) - 1 } : resource
          )
        );
        // Optionally show a brief success message
        // alert('Comment deleted successfully');
      } else {
        alert('Failed to delete comment');
      }
    } catch (err) {
      console.error('Delete comment error:', err);
      alert('Server error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/resources/${selectedResourceId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newComment.trim() }),
      });

      if (res.ok) {
        const newCommentData = await res.json();
        // Add the new comment to the local state
        setComments(prevComments => [...prevComments, newCommentData]);
        // Update the comment count in the resources list
        setResources(prevResources =>
          prevResources.map(resource =>
            resource._id === selectedResourceId ? { ...resource, commentCount: (resource.commentCount || 0) + 1 } : resource
          )
        );
        setNewComment('');
        // Optionally show a brief success message
        // alert('Comment added successfully');
      } else {
        alert('Failed to add comment');
      }
    } catch (err) {
      console.error('Add comment error:', err);
      alert('Server error');
    }
  };

  const openUserModal = async (user) => {
    setSelectedUser(user);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/admin/users/${user._id}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setUserActivities(data.activities || []);
      setShowUserModal(true);
    } catch (err) {
      console.error('Error fetching user activities:', err);
      alert('Failed to load user activities');
    }
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setUserActivities([]);
    setSelectedUser(null);
  };

  const openMessageModal = (user) => {
    setSelectedUser(user);
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setMessageSubject('');
    setMessageContent('');
    setSelectedUser(null);
  };

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageContent.trim()) {
      alert('Subject and content are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/admin/users/${selectedUser._id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: messageSubject.trim(),
          content: messageContent.trim()
        }),
      });

      if (res.ok) {
        alert('Message sent successfully');
        closeMessageModal();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
      alert('Server error');
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/admin/ban/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        alert('User banned successfully');
        fetchAllUsers();
      } else {
        alert('Failed to ban user');
      }
    } catch (err) {
      console.error('Ban user error:', err);
      alert('Server error');
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unban this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/admin/unban/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        alert('User unbanned successfully');
        fetchAllUsers();
      } else {
        alert('Failed to unban user');
      }
    } catch (err) {
      console.error('Unban user error:', err);
      alert('Server error');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/admin/change-role/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        alert('Role changed successfully');
        fetchAllUsers();
      } else {
        alert('Failed to change role');
      }
    } catch (err) {
      console.error('Change role error:', err);
      alert('Server error');
    }
  };

  const handleWarnUser = async (userId) => {
    if (!window.confirm('Are you sure you want to warn this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/admin/warn/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        alert('User warned successfully');
        fetchAllUsers();
      } else {
        alert('Failed to warn user');
      }
    } catch (err) {
      console.error('Warn user error:', err);
      alert('Server error');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/admin/remove/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        alert('User removed successfully');
        fetchAllUsers();
      } else {
        alert('Failed to remove user');
      }
    } catch (err) {
      console.error('Remove user error:', err);
      alert('Server error');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="logo">ReferShelf <span className="admin-badge">Admin</span></div>
        <div className="header-buttons">
          <button className="analytics-btn" onClick={() => navigate('/analytics')}>View Analytics</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="admin-content">
        <h1>Admin Dashboard</h1>

        {/* Stats Overview */}
        <section className="stats-section">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.users}</p>
          </div>
          <div className="stat-card">
            <h3>Total Resources</h3>
            <p className="stat-number">{stats.resources}</p>
          </div>
          <div className="stat-card">
            <h3>Total Downloads</h3>
            <p className="stat-number">{stats.downloads}</p>
          </div>
        </section>

        {/* Subjects Management */}
        <section className="subjects-section">
          <h2>Manage Subjects</h2>
          <form onSubmit={handleCreateSubject} className="create-subject-form">
            <input
              type="text"
              placeholder="New Subject Name"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              required
            />
            <button type="submit">Create Subject</button>
          </form>
          <div className="subjects-list">
            <h3>Existing Subjects</h3>
            <ul>
              {subjects.length > 0 ? (
                subjects.map((sub) => (
                  <li key={sub._id}>
                    {editingId === sub._id ? (
                      <>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => handleUpdateSubject(sub._id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateSubject(sub._id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                        />
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <span>{sub.name}</span>
                        <div>
                          <button onClick={() => handleEditSubject(sub._id, sub.name)}>
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteSubject(sub._id, sub.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))
              ) : (
                <li>No subjects created yet</li>
              )}
            </ul>
          </div>
        </section>

        {/* Activities Log */}
        <section className="activities-section">
          <h2>User Activities</h2>
          <div className="activities-list">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity._id} className="activity-item">
                  <div className="activity-header">
                    <span className="activity-user">{activity.user?.name || activity.user?.email}</span>
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-timestamp">{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="activity-details">
                    {activity.details}
                    {activity.resource && <span> - Resource: {activity.resource.title}</span>}
                    {activity.subject && <span> - Subject: {activity.subject.name}</span>}
                    {activity.comment && <span> - Comment: {activity.comment.comment.substring(0, 50)}...</span>}
                  </div>
                </div>
              ))
            ) : (
              <p>No activities found</p>
            )}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => fetchActivities(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => fetchActivities(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </section>



        {/* Resources Management */}
        <section className="resources-section">
          <h2>All Resources</h2>
          <div className="resources-table-container">
            <table className="resources-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Folder</th>
                  <th>Type</th>
                  <th>Rating</th>
                  <th>Comments</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Downloads</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <tr key={resource._id}>
                      <td>{resource.title}</td>
                      <td>{resource.subject || 'N/A'}</td>
                      <td>{resource.folderId || 'N/A'}</td>
                      <td>{resource.fileType}</td>
                      <td>{resource.likesCount ? resource.likesCount.toFixed(1) + ` (${resource.ratingCount || 0})` : '0.0 (0)'}</td>
                      <td><button onClick={() => openModal(resource._id)}>{resource.commentCount || 0} Comments</button></td>
                      <td>{resource.uploadedBy}</td>
                      <td>{new Date(resource.uploadedAt).toLocaleDateString()}</td>
                      <td>{resource.downloads || 0}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteResource(resource._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center' }}>No resources found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={closeModal}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80%', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3>Comments</h3>
            <div className="comments-list">
              {comments.map(c => (
                <div key={c._id} className="comment" style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                  <p>{c.comment}</p>
                  <small>By {c.user.name} on {new Date(c.createdAt).toLocaleString()}</small>
                  <br />
                  <small>Likes: {c.likesCount || 0}</small>
                  <br />
                  <button onClick={() => handleDeleteComment(c._id)} style={{ marginTop: '5px', color: 'red' }}>Delete</button>
                </div>
              ))}
            </div>
            <button onClick={closeModal} style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {showUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={closeUserModal}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '80%', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3>User Activities for {selectedUser?.name}</h3>
            <div className="activities-list">
              {userActivities.length > 0 ? (
                userActivities.map((activity) => (
                  <div key={activity._id} className="activity-item">
                    <div className="activity-header">
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-timestamp">{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="activity-details">
                      {activity.details}
                      {activity.resource && <span> - Resource: {activity.resource.title}</span>}
                      {activity.subject && <span> - Subject: {activity.subject.name}</span>}
                      {activity.comment && <span> - Comment: {activity.comment.comment.substring(0, 50)}...</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p>No activities found for this user</p>
              )}
            </div>
            <button onClick={closeUserModal} style={{ marginTop: '10px' }}>Close</button>
          </div>
        </div>
      )}

      {showMessageModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={closeMessageModal}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80%', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3>Send Message to {selectedUser?.name}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
              <input
                type="text"
                placeholder="Subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                required
                style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
              />
              <textarea
                placeholder="Message Content"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                required
                style={{ width: '100%', height: '100px', marginBottom: '10px', padding: '8px' }}
              />
              <button type="submit" style={{ marginRight: '10px' }}>Send</button>
              <button type="button" onClick={closeMessageModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;