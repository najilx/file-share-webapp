import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const ShareFile = () => {
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expirationHours, setExpirationHours] = useState(24);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch the list of user's files so they can choose which to share
  const fetchFiles = async () => {
    try {
      const res = await axiosInstance.get('files/list/', { params: { page: 1 } });
      setFiles(res.data.results);
    } catch (err) {
      setError('Could not fetch your files.');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!selectedFileId) {
      setError('Please select a file to share.');
      return;
    }
    if (!recipientEmail) {
      setError('Please enter a recipient email.');
      return;
    }

    try {
      const payload = {
        file: selectedFileId,
        recipient_email: recipientEmail,
        expiration_hours: expirationHours,
        message,
      };
      await axiosInstance.post('files/share/', payload);
      setSuccessMsg('File shared successfully! The recipient will receive an email.');
      // Reset form
      setSelectedFileId('');
      setRecipientEmail('');
      setExpirationHours(24);
      setMessage('');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Could not share file.');
      } else {
        setError('Could not share file. Please try again.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Share a File</h2>
      {error && (
        <div style={{ background: '#fdd', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ background: '#dfd', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {successMsg}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Choose File:</label>
          <br />
          <select
            value={selectedFileId}
            onChange={e => setSelectedFileId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">-- Select a file --</option>
            {files.map(f => (
              <option key={f.id} value={f.id}>
                {f.filename} ({(f.size / (1024 * 1024)).toFixed(2)} MB)
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Recipient's Email:</label>
          <br />
          <input
            type="email"
            value={recipientEmail}
            onChange={e => setRecipientEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Expiration (hours):</label>
          <br />
          <input
            type="number"
            min="1"
            value={expirationHours}
            onChange={e => setExpirationHours(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Message (optional):</label>
          <br />
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows="4"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Share File
        </button>
      </form>
    </div>
  );
};

export default ShareFile;
