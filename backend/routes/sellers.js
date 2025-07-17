// backend/routes/sellers.js
const express = require('express');
const router = express.Router();

// Safe database implementation - using in-memory with error handling
let sellers = [
  {
    id: 1,
    firstName: "Иван",
    lastName: "Петров",
    phone: "+359 888 123 456",
    email: "ivan.petrov@email.bg",
    address: "ул. Раковски 15, София",
    nationalId: "8012031234",
    bankAccount: "BG80BNBG96611020345678",
    commission: 2.5, // percentage
    notes: "Собственик на 3 имота в Лозенец",
    status: "active",
    agentId: 1,
    isArchived: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 2,
    firstName: "Анна",
    lastName: "Стоянова",
    phone: "+359 887 654 321",
    email: "anna@gmail.com",
    address: "бул. Витоша 85, София",
    nationalId: "7502151234",
    bankAccount: "BG80BNBG96611020123456",
    commission: 3.0,
    notes: "Продава апартамент заради преместване",
    status: "active",
    agentId: 1,
    isArchived: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-20')
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
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{6,20}$/;
  return phoneRegex.test(phone);
};

const validateSeller = (data) => {
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
  
  // Commission validation
  if (data.commission && (safeParseFloat(data.commission) < 0 || safeParseFloat(data.commission) > 100)) {
    errors.push('Commission must be between 0 and 100 percent');
  }
  
  // Status validation
  const validStatuses = ['active', 'inactive', 'pending'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push('Status must be one of: active, inactive, pending');
  }
  
  return errors;
};

const sanitizeSeller = (data) => {
  return {
    firstName: data.firstName ? data.firstName.toString().trim() : '',
    lastName: data.lastName ? data.lastName.toString().trim() : '',
    phone: data.phone ? data.phone.toString().trim() : '',
    email: data.email ? data.email.toString().trim() : null,
    address: data.address ? data.address.toString().trim() : '',
    nationalId: data.nationalId ? data.nationalId.toString().trim() : '',
    bankAccount: data.bankAccount ? data.bankAccount.toString().trim() : '',
    commission: safeParseFloat(data.commission, 0),
    notes: data.notes ? data.notes.toString().trim() : '',
    status: data.status || 'active',
    agentId: safeParseInt(data.agentId, 1),
    isArchived: Boolean(data.isArchived)
  };
};

// Routes with comprehensive error handling

// GET /api/sellers - Get all sellers
router.get('/', async (req, res) => {
  try {
    console.log('📊 GET /api/sellers - Fetching all sellers');
    
    const { archived, status } = req.query;
    let filteredSellers = [...sellers];
    
    // Apply filters safely
    if (archived !== undefined) {
      const isArchived = archived === 'true';
      filteredSellers = filteredSellers.filter(s => s.isArchived === isArchived);
    }
    
    if (status && ['active', 'inactive', 'pending'].includes(status)) {
      filteredSellers = filteredSellers.filter(s => s.status === status);
    }
    
    console.log(`✅ Found ${filteredSellers.length} sellers`);
    res.json({
      success: true,
      sellers: filteredSellers,
      total: filteredSellers.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching sellers:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching sellers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sellers/:id - Get single seller
router.get('/:id', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seller ID'
      });
    }
    
    console.log(`📊 GET /api/sellers/${id} - Fetching seller`);
    
    const seller = sellers.find(s => s.id === id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }
    
    console.log(`✅ Found seller: ${seller.firstName} ${seller.lastName}`);
    res.json({
      success: true,
      seller
    });
    
  } catch (error) {
    console.error('❌ Error fetching seller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching seller',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/sellers - Create new seller
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/sellers - Creating new seller');
    console.log('Request body:', req.body);
    
    const sanitizedData = sanitizeSeller(req.body);
    const validationErrors = validateSeller(sanitizedData);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    // Check for duplicate phone numbers
    const existingSeller = sellers.find(s => s.phone === sanitizedData.phone && !s.isArchived);
    if (existingSeller) {
      return res.status(409).json({
        success: false,
        error: 'Seller with this phone number already exists'
      });
    }
    
    const newSeller = {
      id: nextId++,
      ...sanitizedData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    sellers.push(newSeller);
    
    console.log(`✅ Created seller: ${newSeller.firstName} ${newSeller.lastName} (ID: ${newSeller.id})`);
    res.status(201).json({
      success: true,
      message: 'Seller created successfully',
      seller: newSeller
    });
    
  } catch (error) {
    console.error('❌ Error creating seller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating seller',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/sellers/:id - Update seller
router.put('/:id', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seller ID'
      });
    }
    
    console.log(`📝 PUT /api/sellers/${id} - Updating seller`);
    console.log('Request body:', req.body);
    
    const sellerIndex = sellers.findIndex(s => s.id === id);
    if (sellerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }
    
    const sanitizedData = sanitizeSeller(req.body);
    const validationErrors = validateSeller(sanitizedData);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    // Check for duplicate phone numbers (excluding current seller)
    const existingSeller = sellers.find(s => 
      s.phone === sanitizedData.phone && 
      s.id !== id && 
      !s.isArchived
    );
    if (existingSeller) {
      return res.status(409).json({
        success: false,
        error: 'Another seller with this phone number already exists'
      });
    }
    
    const updatedSeller = {
      ...sellers[sellerIndex],
      ...sanitizedData,
      updatedAt: new Date()
    };
    
    sellers[sellerIndex] = updatedSeller;
    
    console.log(`✅ Updated seller: ${updatedSeller.firstName} ${updatedSeller.lastName} (ID: ${id})`);
    res.json({
      success: true,
      message: 'Seller updated successfully',
      seller: updatedSeller
    });
    
  } catch (error) {
    console.error('❌ Error updating seller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating seller',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/sellers/:id - Delete seller
router.delete('/:id', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seller ID'
      });
    }
    
    console.log(`🗑️ DELETE /api/sellers/${id} - Deleting seller`);
    
    const sellerIndex = sellers.findIndex(s => s.id === id);
    if (sellerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }
    
    const deletedSeller = sellers[sellerIndex];
    sellers.splice(sellerIndex, 1);
    
    console.log(`✅ Deleted seller: ${deletedSeller.firstName} ${deletedSeller.lastName} (ID: ${id})`);
    res.json({
      success: true,
      message: 'Seller deleted successfully',
      seller: deletedSeller
    });
    
  } catch (error) {
    console.error('❌ Error deleting seller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting seller',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/sellers/:id/archive - Archive/Unarchive seller
router.post('/:id/archive', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seller ID'
      });
    }
    
    const { archive = true } = req.body;
    console.log(`📦 POST /api/sellers/${id}/archive - ${archive ? 'Archiving' : 'Unarchiving'} seller`);
    
    const sellerIndex = sellers.findIndex(s => s.id === id);
    if (sellerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }
    
    sellers[sellerIndex].isArchived = Boolean(archive);
    sellers[sellerIndex].updatedAt = new Date();
    
    const action = archive ? 'archived' : 'unarchived';
    console.log(`✅ Seller ${action}: ${sellers[sellerIndex].firstName} ${sellers[sellerIndex].lastName} (ID: ${id})`);
    
    res.json({
      success: true,
      message: `Seller ${action} successfully`,
      seller: sellers[sellerIndex]
    });
    
  } catch (error) {
    console.error('❌ Error archiving/unarchiving seller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while archiving seller',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sellers/:id/properties - Get seller's properties
router.get('/:id/properties', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seller ID'
      });
    }
    
    console.log(`🏠 GET /api/sellers/${id}/properties - Fetching seller properties`);
    
    const seller = sellers.find(s => s.id === id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }
    
    // This would normally query the properties database for sellerId
    // For now, return empty array as placeholder
    const properties = [];
    
    console.log(`✅ Found ${properties.length} properties for seller ${id}`);
    res.json({
      success: true,
      properties,
      seller: {
        id: seller.id,
        name: `${seller.firstName} ${seller.lastName}`
      },
      total: properties.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching seller properties:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching seller properties',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sellers/search/:query - Search sellers
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query?.toLowerCase().trim();
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      });
    }
    
    console.log(`🔍 GET /api/sellers/search/${query} - Searching sellers`);
    
    const filteredSellers = sellers.filter(seller => {
      if (seller.isArchived) return false;
      
      const searchText = `${seller.firstName} ${seller.lastName} ${seller.phone} ${seller.email || ''} ${seller.notes || ''}`.toLowerCase();
      return searchText.includes(query);
    });
    
    console.log(`✅ Found ${filteredSellers.length} sellers matching "${query}"`);
    res.json({
      success: true,
      sellers: filteredSellers,
      query,
      total: filteredSellers.length
    });
    
  } catch (error) {
    console.error('❌ Error searching sellers:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while searching sellers',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sellers/stats - Get seller statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 GET /api/sellers/stats - Fetching seller statistics');
    
    const activeSellers = sellers.filter(s => !s.isArchived);
    const stats = {
      total: activeSellers.length,
      active: activeSellers.filter(s => s.status === 'active').length,
      inactive: activeSellers.filter(s => s.status === 'inactive').length,
      pending: activeSellers.filter(s => s.status === 'pending').length,
      archived: sellers.filter(s => s.isArchived).length,
      averageCommission: activeSellers.length > 0 ? 
        activeSellers.reduce((sum, s) => sum + (s.commission || 0), 0) / activeSellers.length : 0,
      totalCommission: activeSellers.reduce((sum, s) => sum + (s.commission || 0), 0)
    };
    
    console.log(`✅ Generated seller statistics`);
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching seller statistics:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching seller statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;