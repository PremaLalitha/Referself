import API_BASE from '../config/api.js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MyUploadPage.css';
import MyUploads from '../components/MyUploads';

function MyUploadsPage() {
  const [resources, setResources] = useState([]);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    async function fetchMyUploads() {
      try {
        const res = await fetch(`${API_BASE}/api/resources?uploadedBy=${userEmail}`);
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error('Error fetching resources:', err);
      }
    }

    fetchMyUploads();
  }, [userEmail]);

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleOpen = (resource) => {
    if (resource.externalLink) {
      const url = resource.externalLink.startsWith('http') ? resource.externalLink : `http://${resource.externalLink}`;
      window.open(url, '_blank');
    } else {
      const url = `${API_BASE}/api/resources/${resource._id}/download?view=true`;
      window.open(url, '_blank');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`${API_BASE}/api/resources/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r._id !== id));
      } else {
        const body = await res.json().catch(() => ({}));
        console.error('Delete failed:', res.status, body);
        alert(body.error || body.message || 'Failed to delete resource.');
      }
    } catch (err) {
      console.error('Error deleting resource:', err);
      alert('Network error while deleting resource.');
    }
  };

  return (
    <div className="my-uploads-page">
      <button className="home-button" onClick={() => navigate('/home')}>
        Go to Home
      </button>
  <MyUploads resources={resources} onEdit={handleEdit} onDelete={handleDelete} onOpen={handleOpen} />
    </div>
  );
}

export default MyUploadsPage;
