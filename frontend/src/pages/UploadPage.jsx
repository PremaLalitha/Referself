import API_BASE from '../config/api.js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UploadPage.css';

function UploadPage() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(''); // ✅ new state
  const [fileType, setFileType] = useState('');
  const [file, setFile] = useState(null);
  const [externalLink, setExternalLink] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [originalFilePath, setOriginalFilePath] = useState('');
  const [originalFileName, setOriginalFileName] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [folder, setFolder] = useState('');

  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();
  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subject) {
      fetchFolders(subject);
    }
  }, [subject]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSubjects(data);
      if (data.length > 0 && !subject) {
        setSubject(data[0].name);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchFolders = async (subjectName) => {
    const subjectObj = subjects.find(s => s.name === subjectName);
    if (!subjectObj) return;
    try {
      const res = await fetch(`${API_BASE}/api/folders/subject/${subjectObj._id}`);
      const data = await res.json();
      setFolders(data);
    } catch (err) {
      console.error('Failed to fetch folders:', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setFolder('');
    setFileType('');
    setFile(null);
    setExternalLink('');
    setTextContent('');
    setIsEditing(false);
    setEditId(null);
    setOriginalFilePath('');
    setOriginalFileName('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const isLink = fileType === 'Link';
    const isFileRequired = !isLink && !file && !isEditing;
    const isLinkRequired = isLink && !externalLink;

    if (!title || !subject || !fileType || isFileRequired || isLinkRequired) {
      alert('⚠️ All fields are required');
      return;
    }

    if (isEditing) {
      try {
        const token = localStorage.getItem('token');
        const body = {
          title: title.trim(),
          subject,
          fileType,
          uploadedBy: userEmail,
          externalLink: isLink ? externalLink.trim() : '',
          filePath: !isLink ? originalFilePath : '',
          fileName: !isLink ? originalFileName : '',
        };

        const res = await fetch(`${API_BASE}/api/resources/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body),
        });

        const updated = await res.json();
        if (res.ok) {
          alert('✅ Resource updated successfully');
          resetForm();
        } else {
          throw new Error(updated.error || updated.message || 'Update failed');
        }
      } catch (err) {
        console.error('Edit error:', err);
        alert(`Update failed: ${err.message}`);
      }
    } else {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('course', subject); // Map subject to course as required by backend
      formData.append('subject', subject); // ✅ include subject
      if (folder) formData.append('folderId', folder);
      formData.append('fileType', fileType);
      formData.append('uploadedBy', userEmail);

      if (isLink) {
        formData.append('externalLink', externalLink.trim());
      } else {
        formData.append('file', file);
      }

      try {
        const res = await fetch(`${API_BASE}/api/resources/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error('Server returned HTML instead of JSON:', text);
          alert('❌ Server error. Check console.');
          return;
        }

        if (res.ok) {
          alert('✅ Upload successful! You earned 1 coin.');
          // Update localStorage coins
          const currentCoins = parseInt(localStorage.getItem('coins') || '0');
          localStorage.setItem('coins', currentCoins + 1);
          resetForm();
        } else {
          // Log the entire data object for inspection
          console.error('Upload failed:', data);
          // Or log a stringified version for a more detailed message in the console
          console.error('Upload failed:', JSON.stringify(data, null, 2));
          const errorMessage = data.message || (data.error && typeof data.error === 'string' ? data.error : 'Upload failed');
          alert(`Upload failed: ${errorMessage}`);
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Server error: ' + err.message);
      }
    }
  };

  const handleEdit = (res) => {
    setTitle(res.title);
    setSubject(res.subject || ''); // ✅ pre-fill subject
    setFolder(res.folderId || ''); // pre-fill folder if exists
    setFileType(res.fileType);
    setExternalLink(res.externalLink || '');
    setTextContent(res.textContent || '');
    setOriginalFilePath(res.filePath || '');
    setOriginalFileName(res.fileName || '');
    setIsEditing(true);
    setEditId(res._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Resource deleted');
        if (editId === id) resetForm();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Server error');
    }
  };

  return (
    <div className="upload-container">
      <button
        className="back-button"
        onClick={() => {
          // If user role is Admin, send to /admin; otherwise, send to /home
          if (userRole === 'Admin') navigate('/admin');
          else navigate('/home');
        }}
      >
        ← Go Back
      </button>
      <h2>{isEditing ? 'Edit Resource' : 'Upload Academic Resource'}</h2>

      <form onSubmit={handleUpload} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select value={subject} onChange={(e) => setSubject(e.target.value)} required>
          <option value="">Select Subject</option>
          {subjects.map((sub) => (
            <option key={sub._id} value={sub.name}>
              {sub.name}
            </option>
          ))}
        </select>
        <select value={folder} onChange={(e) => setFolder(e.target.value)} required={!isEditing}>
          <option value="">Select Folder (optional for edit)</option>
          {folders.map((f) => (
            <option key={f._id} value={f._id}>
              {f.name}
            </option>
          ))}
        </select>
        <select value={fileType} onChange={(e) => setFileType(e.target.value)} required>
          <option value="">Select File Type</option>
          <option value="File">File (any format)</option>
          <option value="Link">Link</option>
        </select>
        {fileType === 'Link' ? (
          <input
            type="url"
            placeholder="Paste external link here"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            required
          />
        ) : (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required={!isEditing}
          />
        )}
        <button type="submit">{isEditing ? 'Update Resource' : 'Upload Resource'}</button>
        {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>
    </div>
  );
}

export default UploadPage;

