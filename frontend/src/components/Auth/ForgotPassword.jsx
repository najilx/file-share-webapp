import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('forgot-password/', { email });
      setMessage('Reset link sent to your email.');
    } catch (err) {
      setMessage(err.response?.data?.email || 'Something went wrong.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', boxShadow: '0 0 10px #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Forgot Password</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '0.75rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Send Reset Link
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem', color: message.includes('sent') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
