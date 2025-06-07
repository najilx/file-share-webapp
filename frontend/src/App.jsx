// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import FileUpload from './components/Files/FileUpload';
import FileList from './components/Files/FileList';
import ShareFile from './components/Sharing/ShareFile';
import SharedList from './components/Sharing/SharedList';
import PublicDownload from './components/Sharing/PublicDownload';
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import ChangePassword from './components/Auth/ChangePassword';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

const App = () => (
  <Router>
    <AuthProvider>
      <Navbar />
      <div style={{ padding: '1rem' }}>
        <Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
  <Route path="/shared/:token" element={<PublicDownload />} />

  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/files" element={<FileList />} />
    <Route path="/upload" element={<FileUpload />} />
    <Route path="/share" element={<ShareFile />} />
    <Route path="/shared-list" element={<SharedList />} />
    <Route path="/change-password" element={<ChangePassword />} />
  </Route>

  {/* Catch-all: redirect to /files if logged in */}
  <Route
    path="*"
    element={
      <ProtectedRoute>
        <FileList />
      </ProtectedRoute>
    }
  />
</Routes>
      </div>
    </AuthProvider>
  </Router>
);

export default App;
