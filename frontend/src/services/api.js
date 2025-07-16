// Enhanced API Service with Better Error Handling and Data Cleaning
const API_BASE_URL = 'https://real-estate-crm-api-cwlr.onrender.com/api';

// Enhanced API call function with retry logic
const apiCall = async (endpoint, options = {}, retries = 2) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`API Call [Attempt ${attempt + 1}]:`, config.method || 'GET', url);
      
      const response = await fetch(url, config);
      
      // Log response status for debugging
      console.log(`API Response [${response.status}]:`, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Details:', errorData);
        
        throw new Error(`${response.status}: ${errorData.error || errorData.details || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('API Success:', data);
      return data;
    } catch (error) {
      console.error(`API call failed (attempt ${attempt + 1}):`, error);
      
      // If it's the last attempt or not a network error, throw
      if (attempt === retries || !error.message.includes('fetch')) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
};

// Data cleaning utilities
const cleanPropertyData = (data) => {
  const cleaned = { ...data };
  
  // Remove empty strings and convert to null
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === '' || cleaned[key] === undefined) {
      cleaned[key] = null;
    }
    
    // Trim strings
    if (typeof cleaned[key] === 'string' && cleaned[key] !== null) {
      cleaned[key] = cleaned[key].trim();
      if (cleaned[key] === '') {
        cleaned[key] = null;
      }
    }
  });
  
  // Ensure required fields are present
  if (!cleaned.title) {
    throw new Error('Title is required');
  }
  if (!cleaned.address) {
    throw new Error('Address is required');
  }
  if (!cleaned.area || isNaN(parseInt(cleaned.area))) {
    throw new Error('Valid area is required');
  }
  if (!cleaned.rooms || isNaN(parseInt(cleaned.rooms))) {
    throw new Error('Valid number of rooms is required');
  }
  
  // Convert numeric fields
  cleaned.area = parseInt(cleaned.area);
  cleaned.rooms = parseInt(cleaned.rooms);
  if (cleaned.floor) cleaned.floor = parseInt(cleaned.floor);
  if (cleaned.totalFloors) cleaned.totalFloors = parseInt(cleaned.totalFloors);
  if (cleaned.yearBuilt) cleaned.yearBuilt = parseInt(cleaned.yearBuilt);
  
  // Convert price fields
  if (cleaned.priceEur) cleaned.priceEur = parseFloat(cleaned.priceEur);
  if (cleaned.monthlyRentEur) cleaned.monthlyRentEur = parseFloat(cleaned.monthlyRentEur);
  
  // Validate type-specific requirements
  if (cleaned.propertyType === 'sale' && (!cleaned.priceEur || cleaned.priceEur <= 0)) {
    throw new Error('Valid price is required for sale properties');
  }
  
  if ((cleaned.propertyType === 'rent' || cleaned.propertyType === 'managed') && 
      (!cleaned.monthlyRentEur || cleaned.monthlyRentEur <= 0)) {
    throw new Error('Valid monthly rent is required for rental properties');
  }
  
  return cleaned;
};

const cleanBuyerData = (data) => {
  const cleaned = { ...data };
  
  // Remove empty strings and convert to null
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === '' || cleaned[key] === undefined) {
      cleaned[key] = null;
    }
    
    // Trim strings
    if (typeof cleaned[key] === 'string' && cleaned[key] !== null) {
      cleaned[key] = cleaned[key].trim();
      if (cleaned[key] === '') {
        cleaned[key] = null;
      }
    }
  });
  
  // Ensure required fields are present
  if (!cleaned.firstName) {
    throw new Error('First name is required');
  }
  if (!cleaned.lastName) {
    throw new Error('Last name is required');
  }
  if (!cleaned.phone) {
    throw new Error('Phone is required');
  }
  
  // Validate email if provided
  if (cleaned.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned.email)) {
      throw new Error('Invalid email format');
    }
  }
  
  // Convert numeric fields
  if (cleaned.budgetMin) cleaned.budgetMin = parseFloat(cleaned.budgetMin);
  if (cleaned.budgetMax) cleaned.budgetMax = parseFloat(cleaned.budgetMax);
  if (cleaned.preferredRooms) cleaned.preferredRooms = parseInt(cleaned.preferredRooms);
  
  // Validate budget range
  if (cleaned.budgetMin && cleaned.budgetMax && cleaned.budgetMin > cleaned.budgetMax) {
    throw new Error('Minimum budget cannot be greater than maximum budget');
  }
  
  // Handle preferred areas array
  if (cleaned.preferredAreas && typeof cleaned.preferredAreas === 'string') {
    cleaned.preferredAreas = cleaned.preferredAreas.split(',').map(area => area.trim()).filter(area => area);
  }
  
  return cleaned;
};

// Enhanced Properties API
export const propertiesAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/properties?${queryParams}` : '/properties';
      return await apiCall(endpoint);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      throw new Error(`Failed to load properties: ${error.message}`);
    }
  },

  getById: async (id) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Invalid property ID');
      }
      return await apiCall(`/properties/${id}`);
    } catch (error) {
      console.error('Failed to fetch property:', error);
      throw new Error(`Failed to load property: ${error.message}`);
    }
  },

  create: async (data) => {
    try {
      const cleanedData = cleanPropertyData(data);
      console.log('Creating property with cleaned data:', cleanedData);
      return await apiCall('/properties', {
        method: 'POST',
        body: JSON.stringify(cleanedData),
      });
    } catch (error) {
      console.error('Failed to create property:', error);
      throw new Error(`Failed to create property: ${error.message}`);
    }
  },

  update: async (id, data) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Invalid property ID');
      }
      const cleanedData = cleanPropertyData(data);
      console.log('Updating property with cleaned data:', cleanedData);
      return await apiCall(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cleanedData),
      });
    } catch (error) {
      console.error('Failed to update property:', error);
      throw new Error(`Failed to update property: ${error.message}`);
    }
  },

  delete: async (id) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Invalid property ID');
      }
      return await apiCall(`/properties/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete property:', error);
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  },
};

// Enhanced Buyers API
export const buyersAPI = {
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/buyers?${queryParams}` : '/buyers';
      return await apiCall(endpoint);
    } catch (error) {
      console.error('Failed to fetch buyers:', error);
      throw new Error(`Failed to load buyers: ${error.message}`);
    }
  },

  getById: async (id) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Invalid buyer ID');
      }
      return await apiCall(`/buyers/${id}`);
    } catch (error) {
      console.error('Failed to fetch buyer:', error);
      throw new Error(`Failed to load buyer: ${error.message}`);
    }
  },

  create: async (data) => {
    try {
      const cleanedData = cleanBuyerData(data);
      console.log('Creating buyer with cleaned data:', cleanedData);
      return await apiCall('/buyers', {
        method: 'POST',
        body: JSON.stringify(cleanedData),
      });
    } catch (error) {
      console.error('Failed to create buyer:', error);
      throw new Error(`Failed to create buyer: ${error.message}`);
    }
  },

  update: async (id, data) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Invalid buyer ID');
      }
      const cleanedData = cleanBuyerData(data);
      console.log('Updating buyer with cleaned data:', cleanedData);
      return await apiCall(`/buyers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cleanedData),
      });
    } catch (error) {
      console.error('Failed to update buyer:', error);
      throw new Error(`Failed to update buyer: ${error.message}`);
    }
  },

  delete: async (id) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Invalid buyer ID');
      }
      return await apiCall(`/buyers/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete buyer:', error);
      throw new Error(`Failed to delete buyer: ${error.message}`);
    }
  },
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await apiCall('/health', {}, 0); // No retries for health check
    return response;
  } catch (error) {
    console.error('Health check failed:', error);
    throw new Error(`API is not responding: ${error.message}`);
  }
};