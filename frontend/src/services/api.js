// frontend/src/services/api.js - CLEAN VERSION WITHOUT DUPLICATIONS
const API_BASE_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';

// Helper function to clean data before sending
const cleanData = (data) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'string') {
        cleaned[key] = value.trim();
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
};

// Helper function to convert types
const convertTypes = (data) => {
  const converted = { ...data };
  
  // Convert numeric fields
  const numericFields = ['area', 'rooms', 'priceEur', 'monthlyRentEur', 'managementFeePercent', 'budgetMin', 'budgetMax'];
  numericFields.forEach(field => {
    if (converted[field] && typeof converted[field] === 'string') {
      const num = parseFloat(converted[field]);
      if (!isNaN(num)) {
        converted[field] = num;
      }
    }
  });
  
  return converted;
};

// Helper function for API calls with retry logic
const apiCall = async (url, options = {}, retries = 3) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`API Call: ${options.method || 'GET'} ${fullUrl}`, options.body ? JSON.parse(options.body) : '');
      
      const response = await fetch(fullUrl, defaultOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = errorText || `HTTP ${response.status} - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log(`API Success: ${options.method || 'GET'} ${fullUrl}`, result);
      return result;
      
    } catch (error) {
      console.error(`API Error (attempt ${i + 1}):`, error.message);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Properties API - COMPLETE WITH ALL FUNCTIONS
export const propertiesAPI = {
  // Get all properties
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(cleanData(filters)).toString();
    const url = `/properties${queryParams ? `?${queryParams}` : ''}`;
    return apiCall(url);
  },

  // Get property by ID
  getById: async (id) => {
    return apiCall(`/properties/${id}`);
  },

  // Create new property
  create: async (propertyData) => {
    const cleanedData = cleanData(propertyData);
    const convertedData = convertTypes(cleanedData);
    
    // Client-side validation
    if (!convertedData.title || !convertedData.propertyType) {
      throw new Error('Заглавие и тип имот са задължителни полета');
    }
    
    if (convertedData.propertyType === 'sale' && !convertedData.priceEur) {
      throw new Error('Цената е задължителна за имоти за продажба');
    }
    
    if ((convertedData.propertyType === 'rent' || convertedData.propertyType === 'managed') && !convertedData.monthlyRentEur) {
      throw new Error('Месечният наем е задължителен за имоти под наем');
    }

    return apiCall('/properties', {
      method: 'POST',
      body: JSON.stringify(convertedData)
    });
  },

  // Update property
  update: async (id, propertyData) => {
    const cleanedData = cleanData(propertyData);
    const convertedData = convertTypes(cleanedData);
    
    // Client-side validation
    if (convertedData.title && convertedData.title.length < 2) {
      throw new Error('Заглавието трябва да бъде поне 2 символа');
    }

    return apiCall(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(convertedData)
    });
  },

  // Delete property
  delete: async (id) => {
    return apiCall(`/properties/${id}`, {
      method: 'DELETE'
    });
  },

  // Archive property
  archive: async (id) => {
    return apiCall(`/properties/${id}/archive`, { method: 'PUT' });
  },

  // Unarchive property
  unarchive: async (id) => {
    return apiCall(`/properties/${id}/unarchive`, { method: 'PUT' });
  },

  // Assign seller to property
  assignSeller: async (id, sellerId) => {
    return apiCall(`/properties/${id}/assign-seller`, {
      method: 'PUT',
      body: JSON.stringify({ sellerId })
    });
  },

  // Assign buyer to property
  assignBuyer: async (id, buyerId, type = 'buyer') => {
    return apiCall(`/properties/${id}/assign-buyer`, {
      method: 'PUT',
      body: JSON.stringify({ buyerId, type })
    });
  },

  // Increment property viewings
  incrementViewings: async (id) => {
    return apiCall(`/properties/${id}/viewings`, { method: 'PUT' });
  },

  // Search properties
  search: async (query, filters = {}) => {
    const searchParams = { 
      q: query,
      ...cleanData(filters)
    };
    const queryParams = new URLSearchParams(searchParams).toString();
    return apiCall(`/search/properties?${queryParams}`);
  }
};

// Buyers API - COMPLETE
export const buyersAPI = {
  // Get all buyers
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(cleanData(filters)).toString();
    const url = `/buyers${queryParams ? `?${queryParams}` : ''}`;
    return apiCall(url);
  },

  // Get buyer by ID
  getById: async (id) => {
    return apiCall(`/buyers/${id}`);
  },

  // Create new buyer
  create: async (buyerData) => {
    const cleanedData = cleanData(buyerData);
    const convertedData = convertTypes(cleanedData);
    
    // Client-side validation
    if (!convertedData.firstName || !convertedData.lastName) {
      throw new Error('Име и фамилия са задължителни полета');
    }
    
    if (!convertedData.phone) {
      throw new Error('Телефонният номер е задължителен');
    }
    
    if (convertedData.email && !convertedData.email.includes('@')) {
      throw new Error('Невалиден имейл адрес');
    }
    
    if (convertedData.budgetMin && convertedData.budgetMax && 
        parseFloat(convertedData.budgetMin) > parseFloat(convertedData.budgetMax)) {
      throw new Error('Минималният бюджет не може да бъде по-голям от максималния');
    }

    return apiCall('/buyers', {
      method: 'POST',
      body: JSON.stringify(convertedData)
    });
  },

  // Update buyer
  update: async (id, buyerData) => {
    const cleanedData = cleanData(buyerData);
    const convertedData = convertTypes(cleanedData);
    
    // Client-side validation
    if (convertedData.email && !convertedData.email.includes('@')) {
      throw new Error('Невалиден имейл адрес');
    }
    
    if (convertedData.budgetMin && convertedData.budgetMax && 
        parseFloat(convertedData.budgetMin) > parseFloat(convertedData.budgetMax)) {
      throw new Error('Минималният бюджет не може да бъде по-голям от максималния');
    }

    return apiCall(`/buyers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(convertedData)
    });
  },

  // Delete buyer
  delete: async (id) => {
    return apiCall(`/buyers/${id}`, {
      method: 'DELETE'
    });
  },

  // Search buyers
  search: async (query, filters = {}) => {
    const searchParams = { 
      q: query,
      ...cleanData(filters)
    };
    const queryParams = new URLSearchParams(searchParams).toString();
    return apiCall(`/search/buyers?${queryParams}`);
  }
};

// Sellers API - COMPLETE
export const sellersAPI = {
  // Get all sellers
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(cleanData(filters)).toString();
    const url = `/sellers${queryParams ? `?${queryParams}` : ''}`;
    return apiCall(url);
  },

  // Get seller by ID
  getById: async (id) => {
    return apiCall(`/sellers/${id}`);
  },

  // Create new seller
  create: async (sellerData) => {
    const cleanedData = cleanData(sellerData);
    const convertedData = convertTypes(cleanedData);
    
    // Client-side validation
    if (!convertedData.firstName || !convertedData.lastName) {
      throw new Error('Име и фамилия са задължителни полета');
    }
    
    if (!convertedData.phone) {
      throw new Error('Телефонният номер е задължителен');
    }
    
    if (convertedData.email && !convertedData.email.includes('@')) {
      throw new Error('Невалиден имейл адрес');
    }

    return apiCall('/sellers', {
      method: 'POST',
      body: JSON.stringify(convertedData)
    });
  },

  // Update seller
  update: async (id, sellerData) => {
    const cleanedData = cleanData(sellerData);
    const convertedData = convertTypes(cleanedData);
    
    // Client-side validation
    if (convertedData.email && !convertedData.email.includes('@')) {
      throw new Error('Невалиден имейл адрес');
    }

    return apiCall(`/sellers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(convertedData)
    });
  },

  // Delete seller
  delete: async (id) => {
    return apiCall(`/sellers/${id}`, { method: 'DELETE' });
  },

  // Archive seller
  archive: async (id) => {
    return apiCall(`/sellers/${id}/archive`, { method: 'PUT' });
  },

  // Assign agent to seller
  assignAgent: async (id, agentId) => {
    return apiCall(`/sellers/${id}/assign-agent`, {
      method: 'PUT',
      body: JSON.stringify({ agentId })
    });
  },

  // Get seller properties
  getProperties: async (id) => {
    return apiCall(`/sellers/${id}/properties`);
  }
};

// Tasks API - COMPLETE
export const tasksAPI = {
  // Get all tasks
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(cleanData(filters)).toString();
    const url = `/tasks${queryParams ? `?${queryParams}` : ''}`;
    return apiCall(url);
  },

  // Get task by ID
  getById: async (id) => {
    return apiCall(`/tasks/${id}`);
  },

  // Create new task
  create: async (taskData) => {
    const cleanedData = cleanData(taskData);
    
    // Client-side validation
    if (!cleanedData.title || !cleanedData.description) {
      throw new Error('Заглавие и описание са задължителни полета');
    }

    return apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify(cleanedData)
    });
  },

  // Update task
  update: async (id, taskData) => {
    const cleanedData = cleanData(taskData);
    return apiCall(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanedData)
    });
  },

  // Delete task
  delete: async (id) => {
    return apiCall(`/tasks/${id}`, { method: 'DELETE' });
  },

  // Complete task
  complete: async (id, notes = '') => {
    return apiCall(`/tasks/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ notes })
    });
  },

  // Reopen task
  reopen: async (id) => {
    return apiCall(`/tasks/${id}/reopen`, { method: 'PUT' });
  },

  // Get overdue tasks
  getOverdue: async (agentId = null) => {
    const params = agentId ? `?agentId=${agentId}` : '';
    return apiCall(`/tasks/overdue/list${params}`);
  },

  // Get upcoming tasks
  getUpcoming: async (agentId = null, days = 7) => {
    const params = new URLSearchParams();
    if (agentId) params.append('agentId', agentId);
    params.append('days', days);
    return apiCall(`/tasks/upcoming/list?${params.toString()}`);
  },

  // Get tasks summary
  getSummary: async (agentId = null) => {
    const params = agentId ? `?agentId=${agentId}` : '';
    return apiCall(`/tasks/summary/stats${params}`);
  }
};

// Analytics API - COMPLETE
export const analyticsAPI = {
  getDashboard: async (refresh = false) => {
    const url = `/analytics/dashboard${refresh ? '?refresh=true' : ''}`;
    return apiCall(url);
  },
  getKPIs: async () => apiCall('/analytics/kpis'),
  getPropertyAnalytics: async (filters = {}) => {
    const queryParams = new URLSearchParams(cleanData(filters)).toString();
    return apiCall(`/analytics/properties${queryParams ? `?${queryParams}` : ''}`);
  },
  getPerformance: async (filters = {}) => {
    const queryParams = new URLSearchParams(cleanData(filters)).toString();
    return apiCall(`/analytics/performance${queryParams ? `?${queryParams}` : ''}`);
  },
  getTrends: async (filters = {}) => {
    const queryParams = new URLSearchParams(cleanData(filters)).toString();
    return apiCall(`/analytics/trends${queryParams ? `?${queryParams}` : ''}`);
  },
  getRevenue: async (period = '12') => {
    return apiCall(`/analytics/revenue?period=${period}`);
  }
};

// Search API - COMPLETE
export const searchAPI = {
  properties: async (query, filters = {}) => {
    return propertiesAPI.search(query, filters);
  },
  buyers: async (query, filters = {}) => {
    return buyersAPI.search(query, filters);
  },
  global: async (query) => {
    return apiCall(`/search/global?q=${encodeURIComponent(query)}`);
  }
};

// Export default object with all APIs
export default {
  properties: propertiesAPI,
  buyers: buyersAPI,
  sellers: sellersAPI,
  tasks: tasksAPI,
  analytics: analyticsAPI,
  search: searchAPI
};