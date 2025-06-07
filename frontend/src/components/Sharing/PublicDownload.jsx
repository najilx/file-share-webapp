import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const PublicDownload = () => {
  const { token } = useParams();
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);

  const fetchPublicFile = async () => {
    try {
      const res = await axiosInstance.get(`files/shared/${token}/`, {
        responseType: 'blob',
      });

      // Extract file info from headers or fallback
      const contentDisposition = res.headers['content-disposition'];
      let fileName = 'file';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match.length === 2) fileName = match[1];
      }

      // Create object URL for download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      setFileInfo({ url, fileName });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Link not found or expired.');
      } else {
        setError('Could not download this file.');
      }
    }
  };

  useEffect(() => {
    fetchPublicFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileInfo.url;
    link.setAttribute('download', fileInfo.fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
      {error ? (
        <div style={{ background: '#fdd', padding: '0.5rem', borderRadius: '4px' }}>
          {error}
        </div>
      ) : fileInfo ? (
        <>
          <h3>Download: {fileInfo.fileName}</h3>
          <button onClick={handleDownload} style={{ padding: '0.5rem 1rem' }}>
            Download Now
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PublicDownload;
