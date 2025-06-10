import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const MAX_TOTAL_SIZE_MB = 100;

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const getTotalSizeMB = (files) => {
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    return totalBytes / (1024 * 1024);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const combinedFiles = [...selectedFiles, ...newFiles];
    const totalSize = getTotalSizeMB(combinedFiles);

    if (totalSize > MAX_TOTAL_SIZE_MB) {
      setError(`Total file size exceeds ${MAX_TOTAL_SIZE_MB} MB.`);
    } else {
      setError(null);
      setSelectedFiles(combinedFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);

    const combinedFiles = [...selectedFiles, ...newFiles];
    const totalSize = getTotalSizeMB(combinedFiles);

    if (totalSize > MAX_TOTAL_SIZE_MB) {
      setError(`Total file size exceeds ${MAX_TOTAL_SIZE_MB} MB.`);
    } else {
      setError(null);
      setSelectedFiles(combinedFiles);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleRemoveFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select files to upload.');
      return;
    }

    const totalSize = getTotalSizeMB(selectedFiles);
    if (totalSize > MAX_TOTAL_SIZE_MB) {
      setError(`Total file size exceeds ${MAX_TOTAL_SIZE_MB} MB.`);
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files[]', file);
    });

    try {
      await axiosInstance.post('files/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/files');
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Upload Files</h2>

      {error && (
        <div style={{ background: '#fdd', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '4px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        Drag & Drop files here
      </div>

      <input type="file" multiple onChange={handleFileChange} />

      {selectedFiles.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <strong>Selected Files:</strong>
          <ul>
            {selectedFiles.map((f, idx) => (
              <li key={idx}>
                {f.name} ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                <button
                  onClick={() => handleRemoveFile(idx)}
                  style={{
                    marginLeft: '1rem',
                    padding: '0.2rem 0.5rem',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={uploading || getTotalSizeMB(selectedFiles) > MAX_TOTAL_SIZE_MB}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: uploading ? '#aaa' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: uploading ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default FileUpload;
