import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const SharedList = () => {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [error, setError] = useState(null);

  const fetchSharedList = async () => {
    try {
      const res = await axiosInstance.get('files/shared-list/');
      setSharedFiles(res.data);
    } catch (err) {
      setError('Could not fetch shared files.');
    }
  };

  useEffect(() => {
    fetchSharedList();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2>Shared Files</h2>
      {error && (
        <div style={{ background: '#fdd', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      {sharedFiles.length === 0 ? (
        <p>No files have been shared yet.</p>
      ) : (
        <table width="100%" border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Shared To</th>
              <th>Share Date</th>
              <th>Accessed?</th>
              <th>Share URL</th>
            </tr>
          </thead>
          <tbody>
            {sharedFiles.map(item => (
              <tr key={item.token}>
                <td>{item.filename}</td>
                <td>{item.recipient_email}</td>
                <td>{new Date(item.shared_at).toLocaleString()}</td>
                <td>{item.accessed ? 'Yes' : 'No'}</td>
                <td>
                  <a
                    href={`/shared/${item.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SharedList;
