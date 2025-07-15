// frontend/src/services/api.js
const API_BASE_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Properties API
export const propertiesAPI = {
  // Get all properties
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/properties?${queryParams}` : '/properties';
    return apiCall(endpoint);
  },

  // Get single property
  getById: async (id) => {
    return apiCall(`/properties/${id}`);
  },

  // Create new property
  create: async (propertyData) => {
    return apiCall('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  },

  // Update property
  update: async (id, propertyData) => {
    return apiCall(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  },

  // Delete property
  delete: async (id) => {
    return apiCall(`/properties/${id}`, {
      method: 'DELETE',
    });
  },
};

// Buyers API
export const buyersAPI = {
  getAll: async () => apiCall('/buyers'),
  getById: async (id) => apiCall(`/buyers/${id}`),
  create: async (buyerData) => apiCall('/buyers', {
    method: 'POST',
    body: JSON.stringify(buyerData),
  }),
  update: async (id, buyerData) => apiCall(`/buyers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(buyerData),
  }),
  delete: async (id) => apiCall(`/buyers/${id}`, { method: 'DELETE' }),
};

// Sellers API
export const sellersAPI = {
  getAll: async () => apiCall('/sellers'),
  getById: async (id) => apiCall(`/sellers/${id}`),
  create: async (sellerData) => apiCall('/sellers', {
    method: 'POST',
    body: JSON.stringify(sellerData),
  }),
  update: async (id, sellerData) => apiCall(`/sellers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sellerData),
  }),
  delete: async (id) => apiCall(`/sellers/${id}`, { method: 'DELETE' }),
};

// Tasks API
export const tasksAPI = {
  getAll: async () => apiCall('/tasks'),
  getById: async (id) => apiCall(`/tasks/${id}`),
  create: async (taskData) => apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  update: async (id, taskData) => apiCall(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  }),
  delete: async (id) => apiCall(`/tasks/${id}`, { method: 'DELETE' }),
  markComplete: async (id) => apiCall(`/tasks/${id}/complete`, {
    method: 'PATCH',
  }),
};

// Search API
export const searchAPI = {
  search: async (query, type = 'all') => {
    return apiCall(`/search?q=${encodeURIComponent(query)}&type=${type}`);
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboard: async () => apiCall('/analytics/dashboard'),
  getKPIs: async () => apiCall('/analytics/kpis'),
};