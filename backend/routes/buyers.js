// backend/routes/buyers.js
const express = require('express');
const router = express.Router();

// Safe database implementation - using in-memory with error handling
let buyers = [
  {
    id: 1,
    firstName: "Мария",
    lastName: "Стоянова", 
    phone: "+359 889 444 555",
    email: "maria@gmail.com",
    budgetMin: 120000,
    budgetMax: 180000,
    preferredPropertyType: "sale",
    preferredAreas: ["Лозенец", "Център", "Витоша"],
    preferredRooms: 3,
    notes: "Търси апартамент за семейството си",
    status: "active",
    lastContact: new Date('2024-01-20'),
    agentId: 1,
    isArchived: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 2,
    firstName: "Петър",
    lastName: "Иванов",
    phone: "+359 887 333 222", 
    email: "petar.ivanov@email.bg",
    budgetMin: 300,
    budgetMax: 500,
    preferredPropertyType: "rent",
    preferredAreas: ["Студентски град", "Младост"],
    preferredRooms: 2,
    notes: "Студент, търси наем близо до университета",
    status: "potential",
    lastContact: new Date('2024-01-18'),
    agentId: 1,
    isArchived: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18')
  }
];

let nextId = 3;

// Utility functions for safe operations
const safeParseInt = (value, defaultValue = null) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const safeParseFloat = (value, defaultValue = null) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  if (!phone) return false;
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{6,20}$/;
  return phoneRegex.test(phone);
};

const validateBuyer = (data) => {
  const errors = [];
  
  // Required fields validation
  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
    errors.push('First name is required and must be a non-empty string');
  }
  
  if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
    errors.push('Last name is required and must be a non-empty string');
  }
  
  if (!validatePhone(data.phone)) {
    errors.push('Phone is required and must be a valid phone number');
  }
  
  // Optional fields validation
  if (data.email && !validateEmail(data.email)) {
    errors.push('Email must be a valid email address');
  }
  
  // Budget validation
  if (data.budgetMin && data.budgetMax && 
      safeParseFloat(data.budgetMin) > safeParseFloat(data.budgetMax)) {
    errors.push('Minimum budget cannot be greater than maximum budget');
  }
  
  // Property type validation
  const validPropertyTypes = ['any', 'sale', 'rent'];
  if (data.preferredPropertyType && !validPropertyTypes.includes(data.preferredPropertyType)) {
    errors.push('Preferred property type must be one of: any, sale, rent');
  }
  
  // Status validation
  const validStatuses = ['potential', 'active', 'inactive', 'converted'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push('Status must be one of: potential, active, inactive, converted');
  }
  
  return errors;
};

const sanitizeBuyer = (data) => {
  return {
    firstName: data.firstName ? data.firstName.toString().trim() : '',
    lastName: data.lastName ? data.lastName.toString().trim() : '',
    phone: data.phone ? data.phone.toString().trim() : '',
    email: data.email ? data.email.toString().trim() : null,
    budgetMin: safeParseFloat(data.budgetMin),
    budgetMax: safeParseFloat(data.budgetMax),
    preferredPropertyType: data.preferredPropertyType || 'any',
    preferredAreas: Array.isArray(data.preferredAreas) ? 
      data.preferredAreas.filter(area => area && area.trim()) : 
      (data.preferredAreas ? [data.preferredAreas.toString().trim()] : []),
    preferredRooms: safeParseInt(data.preferredRooms),
    notes: data.notes ? data.notes.toString().trim() : '',
    status: data.status || 'potential',
    agentId: safeParseInt(data.agentId, 1),
    isArchived: Boolean(data.isArchived)
  };
};

// Routes with comprehensive error handling

// GET /api/buyers - Get all buyers
router.get('/', async (req, res) => {
  try {
    console.log('📊 GET /api/buyers - Fetching all buyers');
    
    const { archived, status, propertyType } = req.query;
    let filteredBuyers = [...buyers];
    
    // Apply filters safely
    if (archived !== undefined) {
      const isArchived = archived === 'true';
      filteredBuyers = filteredBuyers.filter(b => b.isArchived === isArchived);
    }
    
    if (status && ['potential', 'active', 'inactive', 'converted'].includes(status)) {
      filteredBuyers = filteredBuyers.filter(b => b.status === status);
    }
    
    if (propertyType && ['any', 'sale', 'rent'].includes(propertyType)) {
      filteredBuyers = filteredBuyers.filter(b => 
        b.preferredPropertyType === 'any' || b.preferredPropertyType === propertyType
      );
    }
    
    console.log(`✅ Found ${filteredBuyers.length} buyers`);
    res.json({
      success: true,
      buyers: filteredBuyers,
      total: filteredBuyers.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching buyers:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching buyers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/buyers/:id - Get single buyer
router.get('/:id', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid buyer ID'
      });
    }
    
    console.log(`📊 GET /api/buyers/${id} - Fetching buyer`);
    
    const buyer = buyers.find(b => b.id === id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    console.log(`✅ Found buyer: ${buyer.firstName} ${buyer.lastName}`);
    res.json({
      success: true,
      buyer
    });
    
  } catch (error) {
    console.error('❌ Error fetching buyer:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching buyer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/buyers - Create new buyer
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/buyers - Creating new buyer');
    console.log('Request body:', req.body);
    
    const sanitizedData = sanitizeBuyer(req.body);
    const validationErrors = validateBuyer(sanitizedData);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    // Check for duplicate phone numbers
    const existingBuyer = buyers.find(b => b.phone === sanitizedData.phone && !b.isArchived);
    if (existingBuyer) {
      return res.status(409).json({
        success: false,
        error: 'Buyer with this phone number already exists'
      });
    }
    
    const newBuyer = {
      id: nextId++,
      ...sanitizedData,
      lastContact: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    buyers.push(newBuyer);
    
    console.log(`✅ Created buyer: ${newBuyer.firstName} ${newBuyer.lastName} (ID: ${newBuyer.id})`);
    res.status(201).json({
      success: true,
      message: 'Buyer created successfully',
      buyer: newBuyer
    });
    
  } catch (error) {
    console.error('❌ Error creating buyer:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating buyer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/buyers/:id - Update buyer
router.put('/:id', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid buyer ID'
      });
    }
    
    console.log(`📝 PUT /api/buyers/${id} - Updating buyer`);
    console.log('Request body:', req.body);
    
    const buyerIndex = buyers.findIndex(b => b.id === id);
    if (buyerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    const sanitizedData = sanitizeBuyer(req.body);
    const validationErrors = validateBuyer(sanitizedData);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    // Check for duplicate phone numbers (excluding current buyer)
    const existingBuyer = buyers.find(b => 
      b.phone === sanitizedData.phone && 
      b.id !== id && 
      !b.isArchived
    );
    if (existingBuyer) {
      return res.status(409).json({
        success: false,
        error: 'Another buyer with this phone number already exists'
      });
    }
    
    const updatedBuyer = {
      ...buyers[buyerIndex],
      ...sanitizedData,
      updatedAt: new Date()
    };
    
    buyers[buyerIndex] = updatedBuyer;
    
    console.log(`✅ Updated buyer: ${updatedBuyer.firstName} ${updatedBuyer.lastName} (ID: ${id})`);
    res.json({
      success: true,
      message: 'Buyer updated successfully',
      buyer: updatedBuyer
    });
    
  } catch (error) {
    console.error('❌ Error updating buyer:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating buyer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/buyers/:id - Delete buyer
router.delete('/:id', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid buyer ID'
      });
    }
    
    console.log(`🗑️ DELETE /api/buyers/${id} - Deleting buyer`);
    
    const buyerIndex = buyers.findIndex(b => b.id === id);
    if (buyerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    const deletedBuyer = buyers[buyerIndex];
    buyers.splice(buyerIndex, 1);
    
    console.log(`✅ Deleted buyer: ${deletedBuyer.firstName} ${deletedBuyer.lastName} (ID: ${id})`);
    res.json({
      success: true,
      message: 'Buyer deleted successfully',
      buyer: deletedBuyer
    });
    
  } catch (error) {
    console.error('❌ Error deleting buyer:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting buyer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/buyers/:id/archive - Archive/Unarchive buyer
router.post('/:id/archive', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid buyer ID'
      });
    }
    
    const { archive = true } = req.body;
    console.log(`📦 POST /api/buyers/${id}/archive - ${archive ? 'Archiving' : 'Unarchiving'} buyer`);
    
    const buyerIndex = buyers.findIndex(b => b.id === id);
    if (buyerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    buyers[buyerIndex].isArchived = Boolean(archive);
    buyers[buyerIndex].updatedAt = new Date();
    
    const action = archive ? 'archived' : 'unarchived';
    console.log(`✅ Buyer ${action}: ${buyers[buyerIndex].firstName} ${buyers[buyerIndex].lastName} (ID: ${id})`);
    
    res.json({
      success: true,
      message: `Buyer ${action} successfully`,
      buyer: buyers[buyerIndex]
    });
    
  } catch (error) {
    console.error('❌ Error archiving/unarchiving buyer:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while archiving buyer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/buyers/:id/status - Update buyer status
router.put('/:id/status', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    const { status } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid buyer ID'
      });
    }
    
    const validStatuses = ['potential', 'active', 'inactive', 'converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: potential, active, inactive, converted'
      });
    }
    
    console.log(`📊 PUT /api/buyers/${id}/status - Updating status to ${status}`);
    
    const buyerIndex = buyers.findIndex(b => b.id === id);
    if (buyerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    buyers[buyerIndex].status = status;
    buyers[buyerIndex].updatedAt = new Date();
    
    console.log(`✅ Status updated for buyer: ${buyers[buyerIndex].firstName} ${buyers[buyerIndex].lastName} (ID: ${id})`);
    res.json({
      success: true,
      message: 'Buyer status updated successfully',
      buyer: buyers[buyerIndex]
    });
    
  } catch (error) {
    console.error('❌ Error updating buyer status:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating buyer status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/buyers/:id/contact - Update last contact date
router.post('/:id/contact', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid buyer ID'
      });
    }
    
    console.log(`📞 POST /api/buyers/${id}/contact - Updating last contact date`);
    
    const buyerIndex = buyers.findIndex(b => b.id === id);
    if (buyerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    buyers[buyerIndex].lastContact = new Date();
    buyers[buyerIndex].updatedAt = new Date();
    
    console.log(`✅ Last contact updated for buyer: ${buyers[buyerIndex].firstName} ${buyers[buyerIndex].lastName} (ID: ${id})`);
    res.json({
      success: true,
      message: 'Last contact date updated successfully',
      buyer: buyers[buyerIndex]
    });
    
  } catch (error) {
    console.error('❌ Error updating last contact:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating last contact',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/buyers/search - Search buyers
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query?.toLowerCase().trim();
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      });
    }
    
    console.log(`🔍 GET /api/buyers/search/${query} - Searching buyers`);
    
    const filteredBuyers = buyers.filter(buyer => {
      if (buyer.isArchived) return false;
      
      const searchText = `${buyer.firstName} ${buyer.lastName} ${buyer.phone} ${buyer.email || ''} ${buyer.notes || ''}`.toLowerCase();
      return searchText.includes(query);
    });
    
    console.log(`✅ Found ${filteredBuyers.length} buyers matching "${query}"`);
    res.json({
      success: true,
      buyers: filteredBuyers,
      query,
      total: filteredBuyers.length
    });
    
  } catch (error) {
    console.error('❌ Error searching buyers:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while searching buyers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/buyers/stats - Get buyer statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 GET /api/buyers/stats - Fetching buyer statistics');
    
    const activeBuyers = buyers.filter(b => !b.isArchived);
    const stats = {
      total: activeBuyers.length,
      potential: activeBuyers.filter(b => b.status === 'potential').length,
      active: activeBuyers.filter(b => b.status === 'active').length,
      inactive: activeBuyers.filter(b => b.status === 'inactive').length,
      converted: activeBuyers.filter(b => b.status === 'converted').length,
      archived: buyers.filter(b => b.isArchived).length,
      preferSale: activeBuyers.filter(b => b.preferredPropertyType === 'sale').length,
      preferRent: activeBuyers.filter(b => b.preferredPropertyType === 'rent').length,
      averageBudgetMin: activeBuyers.length > 0 ? 
        activeBuyers.reduce((sum, b) => sum + (b.budgetMin || 0), 0) / activeBuyers.length : 0,
      averageBudgetMax: activeBuyers.length > 0 ? 
        activeBuyers.reduce((sum, b) => sum + (b.budgetMax || 0), 0) / activeBuyers.length : 0
    };
    
    console.log(`✅ Generated buyer statistics`);
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching buyer statistics:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching buyer statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;