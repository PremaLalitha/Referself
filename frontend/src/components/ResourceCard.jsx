import API_BASE from '../config/api.js';
import { useState, useEffect } from 'react';
import "../styles/ResourceCard.css";

function StarRating({ resourceId, initialRating, onRatingChange }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    setRating(initialRating || 0);
    // Fetch user's existing rating
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

function ResourceCard({ resource, onEdit, onDelete, onOpen }) {
  if (!resource) {
    return null;
  }

  const { _id: id, title, subject, folderId, likesCount } = resource;
  const folderName = folderId || 'No Folder';

  return (
    <div className="resource-card">
      <div className="thumbnail" />
      <div className="resource-info">
        <strong>{title}</strong>
        <p className="subject-name">Subject: {subject}</p>
        <p className="folder-name">Folder: {folderName}</p>
        <StarRating resourceId={id} initialRating={likesCount} />
        {onOpen && (
          <div className="actions">
            <button
              onClick={() => {
                onOpen(resource);
              }}
            >
              View
            </button>
          </div>
        )}
        {onEdit && onDelete && (
          <div className="actions">
            <button onClick={() => onEdit(id)}>Edit</button>
            <button onClick={() => onDelete(id)}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceCard;
