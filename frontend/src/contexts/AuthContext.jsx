// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// API Configuration - Updated with correct backend URL
const API_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(error => {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // API helper functions
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API call failed: ${endpoint}`, error);
      throw error;
    }
  };

  // Properties API
  const getProperties = () => apiCall('/properties');
  const createProperty = (propertyData) => apiCall('/properties', {
    method: 'POST',
    body: JSON.stringify(propertyData)
  });
  const updateProperty = (id, propertyData) => apiCall(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData)
  });
  const deleteProperty = (id) => apiCall(`/properties/${id}`, {
    method: 'DELETE'
  });

  // Buyers API
  const getBuyers = () => apiCall('/buyers');
  const createBuyer = (buyerData) => apiCall('/buyers', {
    method: 'POST',
    body: JSON.stringify(buyerData)
  });
  const updateBuyer = (id, buyerData) => apiCall(`/buyers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(buyerData)
  });
  const deleteBuyer = (id) => apiCall(`/buyers/${id}`, {
    method: 'DELETE'
  });

  // Sellers API
  const getSellers = () => apiCall('/sellers');
  const createSeller = (sellerData) => apiCall('/sellers', {
    method: 'POST',
    body: JSON.stringify(sellerData)
  });
  const updateSeller = (id, sellerData) => apiCall(`/sellers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sellerData)
  });
  const deleteSeller = (id) => apiCall(`/sellers/${id}`, {
    method: 'DELETE'
  });

  // Tasks API
  const getTasks = () => apiCall('/tasks');
  const createTask = (taskData) => apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
  const updateTask = (id, taskData) => apiCall(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData)
  });
  const deleteTask = (id) => apiCall(`/tasks/${id}`, {
    method: 'DELETE'
  });
  const completeTask = (id) => apiCall(`/tasks/${id}/complete`, {
    method: 'PUT'
  });

  // Users API (Admin only)
  const getUsers = () => apiCall('/auth/users');
  const createUser = (userData) => apiCall('/auth/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  const updateUser = (id, userData) => apiCall(`/auth/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
  const deleteUser = (id) => apiCall(`/auth/users/${id}`, {
    method: 'DELETE'
  });

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    // Properties
    getProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    // Buyers
    getBuyers,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    // Sellers
    getSellers,
    createSeller,
    updateSeller,
    deleteSeller,
    // Tasks
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    // Users (Admin)
    getUsers,
    createUser,
    updateUser,
    deleteUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};