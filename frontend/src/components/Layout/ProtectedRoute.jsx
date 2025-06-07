import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // If called with children, render them; otherwise render nested routes via <Outlet/>
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
