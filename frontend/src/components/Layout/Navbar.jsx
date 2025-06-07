import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#333',
        color: '#fff',
        padding: '0.5rem 1rem',
      }}
    >
      <div>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
          FileShareApp
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {user ? (
          <>
            <Link to="/change-password" style={{ color: '#fff', textDecoration: 'none' }}>
              Change Password
            </Link>
            <Link to="/files" style={{ color: '#fff', textDecoration: 'none' }}>
              My Files
            </Link>
            <Link to="/upload" style={{ color: '#fff', textDecoration: 'none' }}>
              Upload
            </Link>
            <Link to="/share" style={{ color: '#fff', textDecoration: 'none' }}>
              Share File
            </Link>
            <Link to="/shared-list" style={{ color: '#fff', textDecoration: 'none' }}>
              Shared List
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>
              Register
            </Link>
            
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
