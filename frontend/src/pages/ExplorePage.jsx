import API_BASE from '../config/api.js';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExploreResourceItem from "../components/ExploreResourceItem";
import "../styles/ExplorePage.css";

function ExplorePage() {
  const [resources, setResources] = useState([]);
  const [comments, setComments] = useState({}); // resourceId: [comments]
  const [user, setUser] = useState(null); // {id, name} or null
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("authToken");

  const getUser = () => {
    const token = getToken();
    if (token) {
      // Assuming token contains user info, but for simplicity, set user as logged in
      // In real app, decode JWT or fetch user
      return { id: "userId", name: "User Name" }; // Placeholder
    }
    return null;
  };

  useEffect(() => {
    setUser(getUser());

    async function fetchAllResources() {
      try {
        const url = searchTerm ? `${API_BASE}/api/resources?search=${encodeURIComponent(searchTerm)}` : `${API_BASE}/api/resources`;
        const res = await fetch(url);
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
      }
    }

    fetchAllResources();
  }, [searchTerm]);

  const onAddComment = async (resourceId, commentText) => {
    const token = getToken();
    if (!token) return alert("Please login to comment");

    try {
      const res = await fetch(`${API_BASE}/api/resources/${resourceId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: commentText }),
      });
      if (res.ok) {
        // Refresh comments
        await onFetchComments(resourceId);
      } else {
        alert("Failed to add comment");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const onAddRating = async (resourceId) => {
    const token = getToken();
    if (!token) return alert("Please login to like");

    try {
      const res = await fetch(`${API_BASE}/api/resources/${resourceId}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        // Update resource likes count
        setResources((prev) =>
          prev.map((r) =>
            r._id === resourceId ? { ...r, likesCount: data.likesCount } : r
          )
        );
      } else {
        alert("Failed to add like");
      }
    } catch (err) {
      console.error("Error adding like:", err);
    }
  };

  const onFetchComments = async (resourceId) => {
    try {
      const res = await fetch(`${API_BASE}/api/resources/${resourceId}/comments`);
      const data = await res.json();
      setComments((prev) => ({ ...prev, [resourceId]: data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  return (
    <div className="explore-container">
      <button className="back-button" onClick={() => navigate("/home")}>
        ← Go to Home
      </button>

      <h2>Explore Academic Resources</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by title or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {resources.length > 0 ? (
        <div className="resources-list">
          {resources.map((res) => (
            <ExploreResourceItem
              key={res._id}
              resource={res}
              comments={comments[res._id] || []}
              likesCount={res.likesCount || 0}
              onAddComment={onAddComment}
              onAddRating={onAddRating}
              onFetchComments={onFetchComments}
              user={user}
            />
          ))}
        </div>
      ) : (
        <p>No resources available yet.</p>
      )}
    </div>
  );
}

export default ExplorePage;
