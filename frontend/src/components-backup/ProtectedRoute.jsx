// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid #f3f4f6',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span>Зареждане...</span>
        </div>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated()) {
    return <LoginForm />;
  }

  // Show protected content if authenticated
  return children;
};

export default ProtectedRoute;