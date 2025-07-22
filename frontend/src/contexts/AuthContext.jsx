// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Правилният backend URL
const API_BASE_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const apiCall = async (endpoint, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(`Making API call to: ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error('Session expired');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  };

  const validateToken = async () => {
    try {
      const data = await apiCall('/auth/me');
      setUser(data.user);
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // Properties API
  const getProperties = () => apiCall('/properties');
  const createProperty = (data) => apiCall('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const updateProperty = (id, data) => apiCall(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const deleteProperty = (id) => apiCall(`/properties/${id}`, {
    method: 'DELETE',
  });
  const archiveProperty = (id) => apiCall(`/properties/${id}/archive`, {
    method: 'PATCH',
  });
  const restoreProperty = (id) => apiCall(`/properties/${id}/restore`, {
    method: 'PATCH',
  });

  // Buyers API
  const getBuyers = () => apiCall('/buyers');
  const createBuyer = (data) => apiCall('/buyers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const updateBuyer = (id, data) => apiCall(`/buyers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const deleteBuyer = (id) => apiCall(`/buyers/${id}`, {
    method: 'DELETE',
  });
  const archiveBuyer = (id) => apiCall(`/buyers/${id}/archive`, {
    method: 'PATCH',
  });
  const restoreBuyer = (id) => apiCall(`/buyers/${id}/restore`, {
    method: 'PATCH',
  });

  // Sellers API
  const getSellers = () => apiCall('/sellers');
  const createSeller = (data) => apiCall('/sellers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const updateSeller = (id, data) => apiCall(`/sellers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const deleteSeller = (id) => apiCall(`/sellers/${id}`, {
    method: 'DELETE',
  });
  const archiveSeller = (id) => apiCall(`/sellers/${id}/archive`, {
    method: 'PATCH',
  });
  const restoreSeller = (id) => apiCall(`/sellers/${id}/restore`, {
    method: 'PATCH',
  });

  // Tasks API
  const getTasks = () => apiCall('/tasks');
  const createTask = (data) => apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const updateTask = (id, data) => apiCall(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const deleteTask = (id) => apiCall(`/tasks/${id}`, {
    method: 'DELETE',
  });
  const completeTask = (id) => apiCall(`/tasks/${id}/complete`, {
    method: 'PATCH',
  });

  // Users API
  const getUsers = () => apiCall('/users');
  const createUser = (data) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const updateUser = (id, data) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const deleteUser = (id) => apiCall(`/users/${id}`, {
    method: 'DELETE',
  });

  const value = {
    user,
    loading,
    login,
    logout,
    // Properties
    getProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    archiveProperty,
    restoreProperty,
    // Buyers
    getBuyers,
    createBuyer,
    updateBuyer,
    deleteBuyer,
    archiveBuyer,
    restoreBuyer,
    // Sellers
    getSellers,
    createSeller,
    updateSeller,
    deleteSeller,
    archiveSeller,
    restoreSeller,
    // Tasks
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    // Users
    getUsers,
    createUser,
    updateUser,
    deleteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};