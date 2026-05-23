import API_BASE from '../config/api.js';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import Navbar from '../components/Navbar';
import TodoList from '../components/TodoList';
import '../styles/HomePage.css';

// StarRating Component
function StarRating({ resourceId, initialRating, onRatingChange }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    setRating(initialRating || 0);
    fetchUserRating();
  }, [initialRating, resourceId]);

  const fetchUserRating = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/resources/${resourceId}/ratings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.userRating) {
          setUserRating(data.userRating);
        }
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const handleClick = async (starValue) => {
    try {
      const response = await fetch(`${API_BASE}/api/resources/${resourceId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ rating: starValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setRating(data.averageRating);
        setUserRating(starValue);
        onRatingChange && onRatingChange(data.averageRating);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || rating) ? 'filled' : ''} ${userRating && star <= userRating ? 'user-rated' : ''}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleClick(star)}
        >
          ★
        </span>
      ))}
      {userRating && <p className="user-rating">Your rating: {userRating}</p>}
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [topResources, setTopResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const user = { id: localStorage.getItem('userId'), name: userName };

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
      return;
    }

    async function fetchTopResources() {
      try {
        const res = await fetch(`${API_BASE}/api/resources/top-liked`);
        const data = await res.json();
        setTopResources(data);
        setFilteredResources(data);
      } catch (err) {
        console.error("Error fetching top resources:", err);
      }
    }

    fetchTopResources();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = topResources.filter(res =>
        res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResources(filtered);
    } else {
      setFilteredResources(topResources);
    }
  }, [searchTerm, topResources]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleOpen = (resource) => {
    setSelectedResource(resource);
    fetchComments(resource._id);
    setShowModal(true);
  };

  const fetchComments = async (resourceId) => {
    try {
      const res = await fetch(`${API_BASE}/api/resources/${resourceId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleAddComment = async (e, parentCommentId = null) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('No auth token found');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/resources/${selectedResource._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ comment: newComment, parentComment: parentCommentId }),
      });
      if (res.ok) {
        setNewComment('');
        fetchComments(selectedResource._id);
      } else if (res.status === 401) {
        console.error('Unauthorized: Invalid or expired token.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        navigate('/login');
      } else {
        console.error('Error adding comment:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`${API_BASE}/api/resources/${selectedResource._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (res.ok) {
        fetchComments(selectedResource._id);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const res = await fetch(`${API_BASE}/api/resources/${selectedResource._id}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (res.ok) {
        fetchComments(selectedResource._id);
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editingCommentText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/resources/${selectedResource._id}/comments/${editingCommentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ comment: editingCommentText }),
      });
      if (res.ok) {
        setEditingCommentId(null);
        setEditingCommentText('');
        fetchComments(selectedResource._id);
      }
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const renderComments = (comments, depth = 0, parentComment = null) => {
    return comments.map((comment) => (
      <div key={comment._id}>
        <div className="comment" style={{ marginLeft: `${depth * 20}px` }}>
          <div>
            {depth > 0 && parentComment ? (
              <>
                <strong>{comment.user.name}</strong> replied to <strong>{parentComment.user.name}</strong>: {comment.comment}
              </>
            ) : (
              <>
                <strong>{comment.user.name}:</strong> {comment.comment}
              </>
            )}
          </div>
          <small>{new Date(comment.createdAt).toLocaleDateString()}</small>

          <button
            onClick={() => setReplyingTo(comment._id)}
            className="reply-btn"
            style={{ marginLeft: '10px', fontSize: '12px', color: 'blue' }}
          >
            Reply
          </button>
          {user && user.id && comment.user._id.toString() === user.id.toString() && (
            <>
              <button
                onClick={() => handleEditComment(comment._id, comment.comment)}
                className="edit-comment-btn"
                style={{ marginLeft: '10px', fontSize: '12px', color: 'green' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="delete-comment-btn"
                style={{ marginLeft: '10px', fontSize: '12px', color: 'red' }}
              >
                Delete
              </button>
            </>
          )}
          {editingCommentId === comment._id && (
            <form onSubmit={handleUpdateComment} className="comment-form" style={{ marginLeft: '20px' }}>
              <textarea
                value={editingCommentText}
                onChange={(e) => setEditingCommentText(e.target.value)}
                placeholder="Edit your comment..."
                required
              />
              <button type="submit">Update Comment</button>
              <button type="button" onClick={() => { setEditingCommentId(null); setEditingCommentText(''); }}>Cancel</button>
            </form>
          )}
          {replyingTo === comment._id && (
            <form onSubmit={(e) => handleAddComment(e, comment._id)} className="comment-form" style={{ marginLeft: '20px' }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Reply to this comment..."
                required
              />
              <button type="submit">Post Reply</button>
              <button type="button" onClick={() => setReplyingTo(null)}>Cancel</button>
            </form>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {renderComments(comment.replies, depth + 1, comment)}
          </div>
        )}
      </div>
    ));
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedResource(null);
    setComments([]);
    setNewComment('');
    setReplyingTo(null);
    setEditingCommentId(null);
    setEditingCommentText('');
  };



  return (
    <div className="home-page">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} showSearchAndUpload={true} />

      <div className="home-content">
        <main className="dashboard-section">
          <h2 className="section-title">Dashboard</h2>
          <div className="dashboard-content">
            <h3>Resources</h3>
            {filteredResources.length > 0 ? (
              <div className="top-resources-grid">
                {filteredResources.map((res) => (
                  <ResourceCard key={res._id} resource={res} onOpen={handleOpen} />
                ))}
              </div>
            ) : (
              <p>No top-liked resources yet.</p>
            )}
          </div>
        </main>

        <aside className="todo-section">
          <TodoList />
        </aside>
      </div>

      {showModal && selectedResource && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>×</button>
            <h2>{selectedResource.title}</h2>

            <p><strong>Subject:</strong> {selectedResource.subject}</p>
            <p><strong>Folder:</strong> {selectedResource.folderId || 'No Folder'}</p>
            <p><strong>File Type:</strong> {selectedResource.fileType}</p>
            <p><strong>Uploaded At:</strong> {new Date(selectedResource.uploadedAt).toLocaleDateString()}</p>
            <p><strong>Downloads:</strong> {selectedResource.downloads || 0}</p>
            <p><strong>Average Rating:</strong> {selectedResource.likesCount ? selectedResource.likesCount.toFixed(1) : 'Not rated'}</p>
            {selectedResource.externalLink && <p><strong>External Link:</strong> <a href={selectedResource.externalLink} target="_blank" rel="noopener noreferrer">{selectedResource.externalLink}</a></p>}

            <div className="modal-actions">
              <button
                onClick={() => {
                  if (selectedResource.externalLink) {
                    const url = selectedResource.externalLink.startsWith('http') ? selectedResource.externalLink : `http://${selectedResource.externalLink}`;
                    window.open(url, '_blank');
                  } else {
                    const url = `${API_BASE}/api/resources/${selectedResource._id}/download?view=true`;
                    window.open(url, '_blank');
                  }
                }}
                className="view-btn"
              >
                View Resource
              </button>
              {selectedResource.fileType !== "Link" && (
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('authToken');
                    const headers = token ? { Authorization: `Bearer ${token}` } : {};
                    try {
                      const response = await fetch(`${API_BASE}/api/resources/${selectedResource._id}/download`, { headers });
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = selectedResource.fileName || selectedResource.title;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      } else {
                        console.error('Download failed');
                      }
                    } catch (err) {
                      console.error('Error downloading:', err);
                    }
                  }}
                  className="download-btn"
                >
                  Download
                </button>
              )}
            </div>

            <div className="modal-rating">
              <h3>Rate this resource:</h3>
              <StarRating resourceId={selectedResource._id} initialRating={selectedResource.likesCount} onRatingChange={(newRating) => setSelectedResource(prev => ({...prev, likesCount: newRating}))} />
            </div>

            <div className="modal-comments">
              <h3>Comments</h3>
              <div className="comments-list">
                {renderComments(comments)}
              </div>
              {user && !replyingTo && (
                <form onSubmit={handleAddComment} className="comment-form">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    required
                  />
                  <button type="submit">Post Comment</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
