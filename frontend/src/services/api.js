// frontend/src/services/api.js
const API_BASE_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';

// Enhanced API client with retry logic and better error handling
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`API Call: ${config.method || 'GET'} ${url}`);

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.details = errorData.details;
          throw error;
        }

        const data = await response.json();
        console.log(`API Success: ${config.method || 'GET'} ${url}`, data);
        return data;
      } catch (error) {
        console.log(`API Error (attempt ${attempt}): ${error.message}`);
        
        if (attempt === this.retryAttempts) {
          console.error(`Final API Error: ${error.message}`);
          throw new Error(error.message || `Failed to ${config.method || 'GET'} ${endpoint.split('/')[1] || 'resource'}`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Initialize API client
const apiClient = new APIClient(API_BASE_URL);

// Properties API
export const propertiesAPI = {
  // Get all properties
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiClient.get(`/properties${queryString ? `?${queryString}` : ''}`);
  },

  // Get single property
  getById: (id) => apiClient.get(`/properties/${id}`),

  // Create new property
  create: (propertyData) => apiClient.post('/properties', propertyData),

  // Update property
  update: (id, propertyData) => apiClient.put(`/properties/${id}`, propertyData),

  // Delete property
  delete: (id) => apiClient.delete(`/properties/${id}`),

  // Archive/Unarchive property
  archive: (id, archive = true) => apiClient.post(`/properties/${id}/archive`, { archive }),

  // Assign seller to property
  assignSeller: (propertyId, sellerId) => 
    apiClient.post(`/properties/${propertyId}/assign-seller`, { sellerId }),

  // Assign buyer/tenant to property
  assignBuyer: (propertyId, buyerId, isTenant = false) => 
    apiClient.post(`/properties/${propertyId}/assign-buyer`, { 
      [isTenant ? 'tenantId' : 'buyerId']: buyerId, 
      isTenant 
    }),

  // Increment viewing count
  incrementViewing: (id) => apiClient.post(`/properties/${id}/increment-viewing`),

  // Get property statistics
  getStats: () => apiClient.get('/properties/stats')
};

// Buyers API
export const buyersAPI = {
  // Get all buyers
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiClient.get(`/buyers${queryString ? `?${queryString}` : ''}`);
  },

  // Get single buyer
  getById: (id) => apiClient.get(`/buyers/${id}`),

  // Create new buyer
  create: (buyerData) => apiClient.post('/buyers', buyerData),

  // Update buyer
  update: (id, buyerData) => apiClient.put(`/buyers/${id}`, buyerData),

  // Delete buyer
  delete: (id) => apiClient.delete(`/buyers/${id}`),

  // Archive/Unarchive buyer
  archive: (id, archive = true) => apiClient.post(`/buyers/${id}/archive`, { archive }),

  // Update buyer status
  updateStatus: (id, status) => apiClient.put(`/buyers/${id}/status`, { status }),

  // Update last contact date
  updateContact: (id) => apiClient.post(`/buyers/${id}/contact`),

  // Search buyers
  search: (query) => apiClient.get(`/buyers/search/${encodeURIComponent(query)}`),

  // Get buyer statistics
  getStats: () => apiClient.get('/buyers/stats')
};

// Sellers API
export const sellersAPI = {
  // Get all sellers
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiClient.get(`/sellers${queryString ? `?${queryString}` : ''}`);
  },

  // Get single seller
  getById: (id) => apiClient.get(`/sellers/${id}`),

  // Create new seller
  create: (sellerData) => apiClient.post('/sellers', sellerData),

  // Update seller
  update: (id, sellerData) => apiClient.put(`/sellers/${id}`, sellerData),

  // Delete seller
  delete: (id) => apiClient.delete(`/sellers/${id}`),

  // Archive/Unarchive seller
  archive: (id, archive = true) => apiClient.post(`/sellers/${id}/archive`, { archive }),

  // Get seller properties
  getProperties: (id) => apiClient.get(`/sellers/${id}/properties`),

  // Search sellers
  search: (query) => apiClient.get(`/sellers/search/${encodeURIComponent(query)}`),

  // Get seller statistics
  getStats: () => apiClient.get('/sellers/stats')
};

// Tasks API
export const tasksAPI = {
  // Get all tasks
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    return apiClient.get(`/tasks${queryString ? `?${queryString}` : ''}`);
  },

  // Get single task
  getById: (id) => apiClient.get(`/tasks/${id}`),

  // Create new task
  create: (taskData) => apiClient.post('/tasks', taskData),

  // Update task
  update: (id, taskData) => apiClient.put(`/tasks/${id}`, taskData),

  // Delete task
  delete: (id) => apiClient.delete(`/tasks/${id}`),

  // Mark task as completed
  complete: (id) => apiClient.post(`/tasks/${id}/complete`),

  // Get overdue tasks
  getOverdue: () => apiClient.get('/tasks/overdue'),

  // Get upcoming tasks
  getUpcoming: (days = 7) => apiClient.get(`/tasks/upcoming?days=${days}`),

  // Get task statistics
  getStats: () => apiClient.get('/tasks/stats')
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard overview
  getOverview: () => apiClient.get('/analytics/overview'),

  // Get property analytics
  getPropertyAnalytics: (period = '30d') => apiClient.get(`/analytics/properties?period=${period}`),

  // Get buyer analytics
  getBuyerAnalytics: (period = '30d') => apiClient.get(`/analytics/buyers?period=${period}`),

  // Get seller analytics
  getSellerAnalytics: (period = '30d') => apiClient.get(`/analytics/sellers?period=${period}`),

  // Get agent performance
  getAgentPerformance: (agentId, period = '30d') => 
    apiClient.get(`/analytics/agents/${agentId}?period=${period}`),

  // Get revenue analytics
  getRevenueAnalytics: (period = '30d') => apiClient.get(`/analytics/revenue?period=${period}`),

  // Get conversion analytics
  getConversionAnalytics: (period = '30d') => apiClient.get(`/analytics/conversions?period=${period}`)
};

// Search API
export const searchAPI = {
  // Global search
  search: (query, filters = {}) => {
    const params = new URLSearchParams({ query });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiClient.get(`/search?${params.toString()}`);
  },

  // Advanced property search
  searchProperties: (criteria) => apiClient.post('/search/properties', criteria),

  // Search buyers by criteria
  searchBuyers: (criteria) => apiClient.post('/search/buyers', criteria),

  // Get search suggestions
  getSuggestions: (query, type = 'all') => 
    apiClient.get(`/search/suggestions?query=${encodeURIComponent(query)}&type=${type}`),

  // Get autocomplete results
  getAutocomplete: (query, field) => 
    apiClient.get(`/search/autocomplete?query=${encodeURIComponent(query)}&field=${field}`)
};

// Auth API
export const authAPI = {
  // Get current user info
  getCurrentUser: () => apiClient.get('/auth/user'),

  // Update user profile
  updateProfile: (userData) => apiClient.put('/auth/profile', userData),

  // Get user permissions
  getPermissions: () => apiClient.get('/auth/permissions'),

  // Get user activity log
  getActivityLog: (limit = 50) => apiClient.get(`/auth/activity?limit=${limit}`),

  // Update user preferences
  updatePreferences: (preferences) => apiClient.put('/auth/preferences', preferences)
};

// Health check API
export const healthAPI = {
  // Check API health
  check: () => apiClient.get('/health'),

  // Get API routes
  getRoutes: () => apiClient.get('/routes')
};

// Export default object with all APIs
const api = {
  properties: propertiesAPI,
  buyers: buyersAPI,
  sellers: sellersAPI,
  tasks: tasksAPI,
  analytics: analyticsAPI,
  search: searchAPI,
  auth: authAPI,
  health: healthAPI
};

export default api;