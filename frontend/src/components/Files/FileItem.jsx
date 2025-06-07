import React from 'react';

const FileItem = ({ file, onDownload, onDelete }) => {
  return (
    <tr>
      <td>{file.filename}</td>
      <td>{(file.size / (1024 * 1024)).toFixed(2)} MB</td>
      <td>{new Date(file.uploaded_at).toLocaleString()}</td>
      <td>
        <button onClick={() => onDownload(file.id)} style={{ marginRight: '0.5rem' }}>
          Download
        </button>
        <button onClick={() => onDelete(file.id)}>Delete</button>
      </td>
    </tr>
  );
};

export default FileItem;
