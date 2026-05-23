import API_BASE from '../config/api.js';
import React, { useState } from "react";
import { useStats } from "../contexts/StatsContext.jsx";
import "../styles/ExplorePage.css"; // Shared styles

function ExploreResourceItem({ resource, comments = [], likesCount, onAddComment, onAddRating, user, onFetchComments }) {
  const { fetchStats } = useStats();
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);


  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    await onAddComment(resource._id, newComment);
    setNewComment("");
  };

  const handleLikeClick = async () => {
    if (!user) return alert("Please login to like");
    await onAddRating(resource._id);
  };

  const fetchComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    await onFetchComments(resource._id);
    setLoadingComments(false);
    setShowComments(true);
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return alert("Please login to delete comments");
    const token = localStorage.getItem('authToken');
    if (!token) return alert("Authentication required");

    try {
      const response = await fetch(`${API_BASE}/api/resources/${resource._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Refresh comments
        await onFetchComments(resource._id);
      } else {
        alert("Failed to delete comment");
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert("Error deleting comment");
    }
  };



  const downloadUrl = `${API_BASE}/api/resources/${resource._id}/download`;

  const handleOpen = async () => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const url = `${API_BASE}/api/resources/${resource._id}/download?view=true`;
    try {
      const response = await fetch(url, { headers });
      if (response.redirected) {
        window.open(response.url, '_blank');
      } else if (response.ok) {
        try {
          const data = await response.json();
          if (data.url) {
            window.open(data.url, '_blank');
            return;
          }
        } catch (jsonErr) {
          // Not JSON, treat as blob
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } else {
        console.error('Failed to open resource');
      }
    } catch (err) {
      console.error('Error opening resource:', err);
    }
  };

  const handleDownload = async () => {
    const token = localStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const response = await fetch(downloadUrl, { headers });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resource.fileName || resource.title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // Refresh stats to get updated downloads count from backend
        fetchStats();
      } else {
        console.error('Download failed');
      }
    } catch (err) {
      console.error('Error downloading:', err);
    }
  };

  return (
    <div className="resource-item">
      <div className="resource-header">
        <strong>{resource.title}</strong> [{resource.fileType}]

      </div>

      {/* View and Download Buttons */}
      <div className="resource-actions">
        <button onClick={handleOpen} className="view-btn">View</button>
        {resource.fileType !== "Link" && (
          <>
            <span style={{ margin: '0 10px' }}></span>
            <button onClick={handleDownload} className="download-link">Download</button>
          </>
        )}
      </div>



      {/* Comments Section */}
      <div className="comments-section">
        <button onClick={fetchComments} disabled={loadingComments}>
          {loadingComments ? "Loading..." : `View Comments (${comments.length})`}
        </button>
        {showComments && (
          <>
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <strong>{comment.user.name}:</strong> {comment.comment}
                  <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
                  {user && comment.user._id.toString() === user.id.toString() && (
                    <button 
                      onClick={() => handleDeleteComment(comment._id)} 
                      className="delete-comment-btn"
                      style={{ marginLeft: '10px', fontSize: '12px', color: 'red' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
            {user && (
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
          </>
        )}
      </div>
    </div>
  );
}

export default ExploreResourceItem;
