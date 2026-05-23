import API_BASE from '../config/api.js';
import { useState, useEffect } from 'react';

function ResourceForm({ resourceId, isEditing, onSuccess }) {
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('');
  const [file, setFile] = useState(null);
  const [externalLink, setExternalLink] = useState('');
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (isEditing && resourceId) {
      fetch(`${API_BASE}/api/resources?uploadedBy=${userEmail}`)
        .then((res) => res.json())
        .then((data) => {
          const resource = data.find((r) => r._id === resourceId);
          if (resource) {
            setTitle(resource.title);
            setFileType(resource.fileType);
            setExternalLink(resource.externalLink || '');
          }
        });
    }
  }, [isEditing, resourceId, userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isLink = fileType === 'Link';
    const token = localStorage.getItem('authToken');

    if (isEditing) {
      const res = await fetch(`${API_BASE}/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          fileType,
          uploadedBy: userEmail,
          externalLink: isLink ? externalLink : '',
        }),
      });
      const updated = await res.json();
      alert('Resource updated');
      onSuccess && onSuccess(updated);
    } else {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('fileType', fileType);
      formData.append('uploadedBy', userEmail);
      if (isLink) {
        formData.append('externalLink', externalLink);
      } else {
        formData.append('file', file);
      }

      const res = await fetch(`${API_BASE}/api/resources/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();
      alert('Upload successful');
      onSuccess && onSuccess(data.resource);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <select value={fileType} onChange={(e) => setFileType(e.target.value)} required>
        <option value="">Select File Type</option>
        <option value="File">File (any format)</option>
        <option value="Link">External Link</option>
      </select>
      {fileType === 'Link' ? (
        <input
          type="url"
          placeholder="External Link"
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
    </form>
  );
}

export default ResourceForm;
