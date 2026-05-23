import API_BASE from '../config/api.js';
 // SubjectPage.jsx - Updated to show folders or resources based on URL param

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ResourceCard from '../components/ResourceCard';
import '../styles/SubjectPage.css';

function SubjectPage() {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [folderLoading, setFolderLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');

  const fetchFolders = async (subjectId) => {
    setFolderLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/folders/subject/${subjectId}`);
      const data = await res.json();
      setFolders(data);
    } catch (err) {
      console.error('Error fetching folders:', err);
    } finally {
      setFolderLoading(false);
    }
  };

  const fetchResources = async (query) => {
    try {
      const res = await fetch(`${API_BASE}/api/resources?${query}`);
      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await fetch(`${API_BASE}/api/subjects`);
        const data = await res.json();
        setSubjects(data);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!subjects.length) {
      fetchSubjects();
    }
  }, []);

  useEffect(() => {
    if (subjectName && subjects.length > 0) {
      const subject = subjects.find(s => s.name === subjectName);
      if (subject) {
        fetchFolders(subject._id);
        if (!selectedFolderId) {
          fetchResources(`subject=${subjectName}`);
        }
      }
    }
  }, [subjectName, subjects]);

  useEffect(() => {
    if (selectedFolderId && subjectName && subjects.length > 0) {
      fetchResources(`folderId=${selectedFolderId}`);
    }
  }, [selectedFolderId]);

  if (loading) {
    return <div className="subject-loading">Loading...</div>;
  }

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const subject = subjects.find(s => s.name === subjectName);
    if (!subject || !newFolderName) return;

    try {
      const res = await fetch(`${API_BASE}/api/folders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newFolderName, subjectId: subject._id }),
      });
      if (res.ok) {
        setNewFolderName('');
        // Refetch folders
        fetchFolders(subject._id);
      } else {
        const errorData = await res.json();
        alert(`Error creating folder: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error creating folder:', err);
      alert('Network error creating folder');
    }
  };

  const handleEditFolder = async (folderId) => {
    const token = localStorage.getItem('token');
    if (!editFolderName) return;

    try {
      const res = await fetch(`${API_BASE}/api/folders/${folderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editFolderName }),
      });
      if (res.ok) {
        setEditingFolderId(null);
        setEditFolderName('');
        // Refetch folders
        const subject = subjects.find(s => s.name === subjectName);
        if (subject) fetchFolders(subject._id);
      } else {
        const errorData = await res.json();
        alert(`Error updating folder: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating folder:', err);
      alert('Network error updating folder');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure you want to delete this folder?')) return;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE}/api/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        // Refetch folders
        const subject = subjects.find(s => s.name === subjectName);
        fetchFolders(subject._id);
        if (selectedFolderId === folderId) {
          setSelectedFolderId(null);
        }
      }
    } catch (err) {
      console.error('Error deleting folder:', err);
    }
  };

  const startEdit = (folder) => {
    setEditingFolderId(folder._id);
    setEditFolderName(folder.name);
  };

  const cancelEdit = () => {
    setEditingFolderId(null);
    setEditFolderName('');
  };

  const handleFolderClick = (folderId) => {
    setSelectedFolderId(folderId);
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

  const currentUser = localStorage.getItem('userEmail');

  if (!subjectName) {
    // Show subjects
    return (
      <div className="subject-container">
        <button className="home-button" onClick={() => navigate('/home')}>
          Go to Home
        </button>
        <h2>Subjects</h2>
        {subjects.length > 0 ? (
          <ul className="subject-list">
            {subjects.map((subject) => (
              <li key={subject._id}>
                <button className="subject-folder" onClick={() => navigate(`/subject/${subject.name}`)}>
                  {subject.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No subjects found.</p>
        )}
      </div>
    );
  }

  // Show folders and resources for the subject
  const subject = subjects.find(s => s.name === subjectName);
  if (!subject) return <div>Subject not found</div>;

  return (
    <div className="subject-container">
      <button className="home-button" onClick={() => navigate('/home')}>
        Go to Home
      </button>
      <button className="back-button" onClick={() => navigate('/subject')}>
        ← Back to Subjects
      </button>
      <h2>Folders for {subjectName}</h2>

      {/* Create Folder Form */}
      <form onSubmit={handleCreateFolder} className="create-folder-form">
        <input
          type="text"
          placeholder="New Folder Name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          required
        />
        <button type="submit" className="create-folder-btn">Create Folder</button>
      </form>

      {folderLoading ? (
        <p>Loading folders...</p>
      ) : (
        <ul className="folders-list">
          {folders.length > 0 ? (
            folders.map((folder) => (
              <li key={folder._id}>
                {editingFolderId === folder._id ? (
                  <div className="edit-folder">
                    <input
                      type="text"
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                    />
                    <button onClick={() => handleEditFolder(folder._id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <button
                      className={`folder-item ${selectedFolderId === folder._id ? 'selected' : ''}`}
                      onClick={() => handleFolderClick(folder._id)}
                    >
                      {folder.name}
                    </button>
                    {folder.createdBy === currentUser && (
                      <>
                        <button onClick={() => startEdit(folder)} className="edit-btn">Edit</button>
                        <button onClick={() => handleDeleteFolder(folder._id)} className="delete-btn">Delete</button>
                      </>
                    )}
                  </>
                )}
              </li>
            ))
          ) : (
            <p>No folders yet. Create one above.</p>
          )}
        </ul>
      )}

      {/* Resources for selected folder or subject */}
      <h3>Resources {selectedFolderId ? 'in selected folder' : 'in subject'}</h3>
      {loading ? (
        <p>Loading resources...</p>
      ) : resources.length > 0 ? (
        <div className="resources-grid">
          {resources.map((res) => (
            <ResourceCard key={res._id} resource={res} onOpen={handleOpen} />
          ))}
        </div>
      ) : (
        <p>No resources found.</p>
      )}
    </div>
  );
}

export default SubjectPage;
