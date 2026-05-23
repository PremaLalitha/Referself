import API_BASE from '../config/api.js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CommentsPage.css';

function CommentsPage() {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  const fetchComments = async () => {
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');

    if (!token || !userEmail) {
      navigate('/login');
      return;
    }

    try {
      const userRes = await fetch(`${API_BASE}/api/users?email=${userEmail}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await userRes.json();
      if (!userRes.ok) {
        setMessage(userData.error || 'Failed to fetch user details');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/resources/comments/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setComments(data);
      } else {
        setMessage(data.error || 'Failed to fetch comments');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setMessage('Server error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [navigate]);

  const handleEdit = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
  };

  const handleSaveEdit = async (resourceId, commentId) => {
    if (!editText.trim()) {
      setMessage('Comment cannot be empty');
      return;
    }

    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_BASE}/api/resources/${resourceId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: editText }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Comment updated successfully');
        setEditingCommentId(null);
        setEditText('');
        fetchComments(); // Refetch comments
      } else {
        setMessage(data.error || 'Failed to update comment');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleDelete = async (resourceId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_BASE}/api/resources/${resourceId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Comment deleted successfully');
        fetchComments(); // Refetch comments
      } else {
        setMessage(data.error || 'Failed to delete comment');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };



  if (loading) {
    return <div className="comments-container"><p>Loading comments...</p></div>;
  }

  return (
    <div className="comments-container">
      <h1>My Comments</h1>
      <button onClick={() => navigate('/profile')}>Back to Profile</button>
      {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
      {comments.length === 0 ? (
        <p>No comments found.</p>
      ) : (
        <div className="comments-list">
          {comments
            .filter(comment => !comment.parentComment) // Only top-level comments
            .map(comment => {
              const replies = comments.filter(c => c.parentComment === comment._id);
              return (
                <div key={comment._id} className="comment-item">
                  {editingCommentId === comment._id ? (
                    <div className="edit-comment">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows="3"
                        placeholder="Edit your comment..."
                      />
                      <div className="edit-buttons">
                        <button onClick={() => handleSaveEdit(comment.resource._id, comment._id)}>Save</button>
                        <button onClick={handleCancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p><strong>Comment:</strong> {comment.comment}</p>
                      <p><strong>Resource:</strong> {comment.resource.title}</p>
                      <p><strong>Date:</strong> {new Date(comment.createdAt).toLocaleDateString()}</p>
                      <div className="comment-actions">
                        <button onClick={() => handleEdit(comment._id, comment.comment)}>Edit</button>
                        <button onClick={() => handleDelete(comment.resource._id, comment._id)}>Delete</button>
                      </div>
                    </>
                  )}
                  {replies.length > 0 && (
                    <div className="replies">
                      {replies.map(reply => (
                        <div key={reply._id} className="reply-item">
                          {editingCommentId === reply._id ? (
                            <div className="edit-comment">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows="2"
                                placeholder="Edit your reply..."
                              />
                              <div className="edit-buttons">
                                <button onClick={() => handleSaveEdit(reply.resource._id, reply._id)}>Save</button>
                                <button onClick={handleCancelEdit}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p><strong>Reply:</strong> {reply.comment}</p>
                              <p><strong>Resource:</strong> {reply.resource.title}</p>
                              <p><strong>Date:</strong> {new Date(reply.createdAt).toLocaleDateString()}</p>
                              <div className="comment-actions">
                                <button onClick={() => handleEdit(reply._id, reply.comment)}>Edit</button>
                                <button onClick={() => handleDelete(reply.resource._id, reply._id)}>Delete</button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default CommentsPage;
