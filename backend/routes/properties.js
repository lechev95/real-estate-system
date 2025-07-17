// backend/routes/properties.js
const express = require('express');
const router = express.Router();

// Safe database implementation - using in-memory with error handling
let properties = [
  {
    id: 1,
    title: "Тристаен апартамент в Лозенец",
    propertyType: "sale",
    category: "apartment",
    address: "ул. Фритьоф Нансен 25",
    city: "София",
    district: "Лозенец",
    area: 120,
    rooms: 3,
    floor: 4,
    totalFloors: 6,
    yearBuilt: 2015,
    exposure: "Юг",
    heating: "Централно парно",
    priceEur: 165000,
    monthlyRentEur: null,
    description: "Светъл тристаен апартамент с две тераси и паркомясто",
    status: "available",
    viewings: 12,
    sellerId: null,
    buyerId: null,
    tenantId: null,
    agentId: 1,
    isArchived: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 2,
    title: "Двустаен под наем в Студентски град",
    propertyType: "rent", 
    category: "apartment",
    address: "бул. Климент Охридски 14",
    city: "София",
    district: "Студентски град",
    area: 65,
    rooms: 2,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 2010,
    exposure: "Изток",
    heating: "Газово",
    priceEur: null,
    monthlyRentEur: 450,
    description: "Уютен двустаен апартамент близо до университета",
    status: "rented",
    viewings: 8,
    sellerId: null,
    buyerId: null,
    tenantId: 2,
    agentId: 1,
    isArchived: false,
    createdAt: new Date('2024-01-10'),
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

const validateProperty = (data) => {
  const errors = [];
  
  // Required fields validation
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }
  
  if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
    errors.push('Address is required and must be a non-empty string');
  }
  
  if (!data.area || safeParseInt(data.area) <= 0) {
    errors.push('Area is required and must be a positive number');
  }
  
  if (!data.rooms || safeParseInt(data.rooms) <= 0) {
    errors.push('Rooms is required and must be a positive number');
  }
  
  // Property type validation
  const validPropertyTypes = ['sale', 'rent', 'managed'];
  if (!validPropertyTypes.includes(data.propertyType)) {
    errors.push('Property type must be one of: sale, rent, managed');
  }
  
  // Category validation
  const validCategories = ['apartment', 'house', 'office', 'commercial'];
  if (data.category && !validCategories.includes(data.category)) {
    errors.push('Category must be one of: apartment, house, office, commercial');
  }
  
  // Price validation based on property type
  if (data.propertyType === 'sale') {
    if (!data.priceEur || safeParseFloat(data.priceEur) <= 0) {
      errors.push('Price in EUR is required for sale properties and must be positive');
    }
  }
  
  if (data.propertyType === 'rent' || data.propertyType === 'managed') {
    if (!data.monthlyRentEur || safeParseFloat(data.monthlyRentEur) <= 0) {
      errors.push('Monthly rent in EUR is required for rent/managed properties and must be positive');
    }
  }
  
  return errors;
};

const sanitizeProperty = (data) => {
  return {
    title: data.title ? data.title.toString().trim() : '',
    propertyType: data.propertyType || 'sale',
    category: data.category || 'apartment',
    address: data.address ? data.address.toString().trim() : '',
    city: data.city ? data.city.toString().trim() : 'София',
    district: data.district ? data.district.toString().trim() : '',
    area: safeParseInt(data.area, 0),
    rooms: safeParseInt(data.rooms, 1),
    floor: safeParseInt(data.floor),
    totalFloors: safeParseInt(data.totalFloors),
    yearBuilt: safeParseInt(data.yearBuilt),
    exposure: data.exposure ? data.exposure.toString().trim() : '',
    heating: data.heating ? data.heating.toString().trim() : '',
    priceEur: safeParseFloat(data.priceEur),
    monthlyRentEur: safeParseFloat(data.monthlyRentEur),
    description: data.description ? data.description.toString().trim() : '',
    status: data.status || 'available',
    sellerId: safeParseInt(data.sellerId),
    buyerId: safeParseInt(data.buyerId),
    tenantId: safeParseInt(data.tenantId),
    agentId: safeParseInt(data.agentId, 1),
    isArchived: Boolean(data.isArchived)
  };
};

// Routes with comprehensive error handling

// GET /api/properties - Get all properties
router.get('/', async (req, res) => {
  try {
    console.log('📊 GET /api/properties - Fetching all properties');
    
    const { archived, type, status } = req.query;
    let filteredProperties = [...properties];
    
    // Apply filters safely
    if (archived !== undefined) {
      const isArchived = archived === 'true';
      filteredProperties = filteredProperties.filter(p => p.isArchived === isArchived);
    }
    
    if (type && ['sale', 'rent', 'managed'].includes(type)) {
      filteredProperties = filteredProperties.filter(p => p.propertyType === type);
    }
    
    if (status && ['available', 'rented', 'sold', 'managed'].includes(status)) {
      filteredProperties = filteredProperties.filter(p => p.status === status);
    }
    
    console.log(`✅ Found ${filteredProperties.length} properties`);
    res.json({
      success: true,
      properties: filteredProperties,
      total: filteredProperties.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching properties:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching properties',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property ID'
      });
    }
    
    console.log(`📊 GET /api/properties/${id} - Fetching property`);
    
    const property = properties.find(p => p.id === id);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    console.log(`✅ Found property: ${property.title}`);
    res.json({
      success: true,
      property
    });
    
  } catch (error) {
    console.error('❌ Error fetching property:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching property',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/properties - Create new property
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/properties - Creating new property');
    console.log('Request body:', req.body);
    
    const sanitizedData = sanitizeProperty(req.body);
    const validationErrors = validateProperty(sanitizedData);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    const newProperty = {
      id: nextId++,
      ...sanitizedData,
      viewings: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    properties.push(newProperty);
    
    console.log(`✅ Created property: ${newProperty.title} (ID: ${newProperty.id})`);
    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: newProperty
    });
    
  } catch (error) {
    console.error('❌ Error creating property:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating property',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property ID'
      });
    }
    
    console.log(`📝 PUT /api/properties/${id} - Updating property`);
    console.log('Request body:', req.body);
    
    const propertyIndex = properties.findIndex(p => p.id === id);
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    const sanitizedData = sanitizeProperty(req.body);
    const validationErrors = validateProperty(sanitizedData);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    const updatedProperty = {
      ...properties[propertyIndex],
      ...sanitizedData,
      updatedAt: new Date()
    };
    
    properties[propertyIndex] = updatedProperty;
    
    console.log(`✅ Updated property: ${updatedProperty.title} (ID: ${id})`);
    res.json({
      success: true,
      message: 'Property updated successfully',
      property: updatedProperty
    });
    
  } catch (error) {
    console.error('❌ Error updating property:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating property',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property ID'
      });
    }
    
    console.log(`🗑️ DELETE /api/properties/${id} - Deleting property`);
    
    const propertyIndex = properties.findIndex(p => p.id === id);
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    const deletedProperty = properties[propertyIndex];
    properties.splice(propertyIndex, 1);
    
    console.log(`✅ Deleted property: ${deletedProperty.title} (ID: ${id})`);
    res.json({
      success: true,
      message: 'Property deleted successfully',
      property: deletedProperty
    });
    
  } catch (error) {
    console.error('❌ Error deleting property:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting property',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/properties/:id/archive - Archive/Unarchive property
router.post('/:id/archive', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property ID'
      });
    }
    
    const { archive = true } = req.body;
    console.log(`📦 POST /api/properties/${id}/archive - ${archive ? 'Archiving' : 'Unarchiving'} property`);
    
    const propertyIndex = properties.findIndex(p => p.id === id);
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    properties[propertyIndex].isArchived = Boolean(archive);
    properties[propertyIndex].updatedAt = new Date();
    
    const action = archive ? 'archived' : 'unarchived';
    console.log(`✅ Property ${action}: ${properties[propertyIndex].title} (ID: ${id})`);
    
    res.json({
      success: true,
      message: `Property ${action} successfully`,
      property: properties[propertyIndex]
    });
    
  } catch (error) {
    console.error('❌ Error archiving/unarchiving property:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while archiving property',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/properties/:id/assign-seller - Assign seller to property
router.post('/:id/assign-seller', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    const sellerId = safeParseInt(req.body.sellerId);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property ID'
      });
    }
    
    console.log(`👤 POST /api/properties/${id}/assign-seller - Assigning seller ${sellerId}`);
    
    const propertyIndex = properties.findIndex(p => p.id === id);
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    properties[propertyIndex].sellerId = sellerId;
    properties[propertyIndex].updatedAt = new Date();
    
    console.log(`✅ Seller assigned to property: ${properties[propertyIndex].title} (ID: ${id})`);
    res.json({
      success: true,
      message: 'Seller assigned successfully',
      property: properties[propertyIndex]
    });
    
  } catch (error) {
    console.error('❌ Error assigning seller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while assigning seller',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/properties/:id/assign-buyer - Assign buyer/tenant to property
router.post('/:id/assign-buyer', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    const { buyerId, tenantId, isTenant = false } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property ID'
      });
    }
    
    console.log(`👤 POST /api/properties/${id}/assign-buyer - Assigning ${isTenant ? 'tenant' : 'buyer'}`);
    
    const propertyIndex = properties.findIndex(p => p.id === id);
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    if (isTenant) {
      properties[propertyIndex].tenantId = safeParseInt(tenantId);
      properties[propertyIndex].status = 'rented';
    } else {
      properties[propertyIndex].buyerId = safeParseInt(buyerId);
      properties[propertyIndex].status = 'sold';
    }
    
    properties[propertyIndex].updatedAt = new Date();
    
    console.log(`✅ ${isTenant ? 'Tenant' : 'Buyer'} assigned to property: ${properties[propertyIndex].title} (ID: ${id})`);
    res.json({
      success: true,
      message: `${isTenant ? 'Tenant' : 'Buyer'} assigned successfully`,
      property: properties[propertyIndex]
    });
    
  } catch (error) {
    console.error('❌ Error assigning buyer/tenant:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while assigning buyer/tenant',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/properties/:id/increment-viewing - Increment viewing count
router.post('/:id/increment-viewing', async (req, res) => {
  try {
    const id = safeParseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid property ID'
      });
    }
    
    console.log(`👁️ POST /api/properties/${id}/increment-viewing - Incrementing viewing count`);
    
    const propertyIndex = properties.findIndex(p => p.id === id);
    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    properties[propertyIndex].viewings = (properties[propertyIndex].viewings || 0) + 1;
    properties[propertyIndex].updatedAt = new Date();
    
    console.log(`✅ Viewing count incremented for property: ${properties[propertyIndex].title} (ID: ${id})`);
    res.json({
      success: true,
      message: 'Viewing count incremented',
      property: properties[propertyIndex]
    });
    
  } catch (error) {
    console.error('❌ Error incrementing viewing count:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while incrementing viewing count',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;