import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import FileItem from './FileItem';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [nextPageExists, setNextPageExists] = useState(false);
  const [prevPageExists, setPrevPageExists] = useState(false);

  // Fetch file list with optional search and pagination
  const fetchFiles = async (pageNumber = 1, search = '') => {
    try {
      const res = await axiosInstance.get('files/list/', {
        params: { page: pageNumber, search: search },
      });
      setFiles(res.data.results);
      setNextPageExists(!!res.data.next);
      setPrevPageExists(!!res.data.previous);
      setPage(pageNumber);
      setError(null);
    } catch (err) {
      setError('Could not fetch files.');
    }
  };

  const handleSearch = e => {
    e.preventDefault();
    fetchFiles(1, searchTerm);
  };

  const handleDownload = async id => {
    try {
      const res = await axiosInstance.get(`files/download/${id}/`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');

      const contentDisposition = res.headers['content-disposition'];
      let fileName = 'downloaded_file';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match?.length === 2) fileName = match[1];
      }

      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Download failed.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await axiosInstance.delete(`files/delete/${id}/`);
      fetchFiles(page, searchTerm); // refresh list
    } catch (err) {
      setError('Delete failed.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2>My Files</h2>

      {error && (
        <div style={{ background: '#fdd', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', width: '60%' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>
          Search
        </button>
      </form>

      <button onClick={() => fetchFiles(1, searchTerm)} style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
        Load Files
      </button>

      {files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        <table width="100%" border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <FileItem
                key={file.id}
                file={file}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => fetchFiles(page - 1, searchTerm)}
          disabled={!prevPageExists}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => fetchFiles(page + 1, searchTerm)}
          disabled={!nextPageExists}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FileList;
