// backend/routes/properties.js - FINAL FIXED VERSION
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to clean and validate data
const cleanPropertyData = (data) => {
  const cleaned = {};
  
  // Required fields
  if (data.title) cleaned.title = data.title.toString().trim();
  if (data.propertyType) cleaned.propertyType = data.propertyType.toString();
  if (data.address) cleaned.address = data.address.toString().trim();
  if (data.city) cleaned.city = data.city.toString().trim();
  
  // Optional fields with default values
  cleaned.category = data.category?.toString() || 'apartment';
  cleaned.status = data.status?.toString() || 'available';
  
  // Numeric fields with proper conversion
  if (data.area !== undefined && data.area !== null && data.area !== '') {
    const area = parseFloat(data.area);
    if (!isNaN(area) && area > 0) cleaned.area = area;
  }
  
  if (data.rooms !== undefined && data.rooms !== null && data.rooms !== '') {
    const rooms = parseInt(data.rooms);
    if (!isNaN(rooms) && rooms > 0) cleaned.rooms = rooms;
  }
  
  if (data.floor !== undefined && data.floor !== null && data.floor !== '') {
    const floor = parseInt(data.floor);
    if (!isNaN(floor)) cleaned.floor = floor;
  }
  
  if (data.totalFloors !== undefined && data.totalFloors !== null && data.totalFloors !== '') {
    const totalFloors = parseInt(data.totalFloors);
    if (!isNaN(totalFloors)) cleaned.totalFloors = totalFloors;
  }
  
  if (data.yearBuilt !== undefined && data.yearBuilt !== null && data.yearBuilt !== '') {
    const yearBuilt = parseInt(data.yearBuilt);
    if (!isNaN(yearBuilt)) cleaned.yearBuilt = yearBuilt;
  }
  
  // Price fields
  if (data.priceEur !== undefined && data.priceEur !== null && data.priceEur !== '') {
    const price = parseFloat(data.priceEur);
    if (!isNaN(price) && price >= 0) cleaned.priceEur = price.toString();
  }
  
  if (data.monthlyRentEur !== undefined && data.monthlyRentEur !== null && data.monthlyRentEur !== '') {
    const rent = parseFloat(data.monthlyRentEur);
    if (!isNaN(rent) && rent >= 0) cleaned.monthlyRentEur = rent.toString();
  }
  
  if (data.managementFeePercent !== undefined && data.managementFeePercent !== null && data.managementFeePercent !== '') {
    const fee = parseFloat(data.managementFeePercent);
    if (!isNaN(fee) && fee >= 0) cleaned.managementFeePercent = fee;
  }
  
  // Optional string fields
  ['district', 'exposure', 'heating', 'description', 'notes'].forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      cleaned[field] = data[field].trim();
    }
  });
  
  // ID fields for relationships
  ['sellerId', 'assignedAgentId'].forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const id = parseInt(data[field]);
      if (!isNaN(id) && id > 0) cleaned[field] = id;
    }
  });
  
  // Numeric fields that can be 0
  if (data.viewings !== undefined && data.viewings !== null) {
    const viewings = parseInt(data.viewings);
    if (!isNaN(viewings) && viewings >= 0) cleaned.viewings = viewings;
  }
  
  return cleaned;
};

// GET /api/properties - Get all properties with full relationships
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, propertyType, status, city, sellerId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (propertyType && propertyType !== 'all') where.propertyType = propertyType;
    if (status && status !== 'all') where.status = status;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (sellerId) where.sellerId = parseInt(sellerId);
    
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true
            }
          },
          assignedAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          tenants: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              leaseStart: true,
              leaseEnd: true
            }
          },
          buyers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.property.count({ where })
    ]);

    res.json({
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ 
      error: 'Failed to fetch properties',
      details: error.message 
    });
  }
});

// GET /api/properties/:id - Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = parseInt(id);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        seller: true,
        assignedAgent: true,
        tenants: true,
        buyers: true,
        tasks: {
          include: {
            assignedAgent: true
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);

  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ 
      error: 'Failed to fetch property',
      details: error.message 
    });
  }
});

// POST /api/properties - Create new property
router.post('/', async (req, res) => {
  try {
    console.log('Creating property with data:', req.body);
    
    const cleanedData = cleanPropertyData(req.body);
    console.log('Cleaned data:', cleanedData);
    
    // Validation
    if (!cleanedData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!cleanedData.address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    if (!cleanedData.area || cleanedData.area <= 0) {
      return res.status(400).json({ error: 'Valid area is required' });
    }
    
    if (!cleanedData.rooms || cleanedData.rooms <= 0) {
      return res.status(400).json({ error: 'Valid number of rooms is required' });
    }
    
    // Property type specific validation
    if (cleanedData.propertyType === 'sale' && !cleanedData.priceEur) {
      return res.status(400).json({ error: 'Price is required for sale properties' });
    }
    
    if ((cleanedData.propertyType === 'rent' || cleanedData.propertyType === 'managed') && 
        !cleanedData.monthlyRentEur) {
      return res.status(400).json({ error: 'Monthly rent is required for rental properties' });
    }

    // Set default values
    if (!cleanedData.viewings) cleanedData.viewings = 0;
    if (!cleanedData.city) cleanedData.city = 'София';
    
    const newProperty = await prisma.property.create({
      data: cleanedData,
      include: {
        seller: true,
        assignedAgent: true,
        tenants: true,
        buyers: true
      }
    });

    console.log('Created property:', newProperty);
    res.status(201).json(newProperty);

  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ 
      error: 'Failed to create property',
      details: error.message 
    });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = parseInt(id);
    
    console.log(`Updating property ${propertyId} with data:`, req.body);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const cleanedData = cleanPropertyData(req.body);
    console.log('Cleaned update data:', cleanedData);
    
    // Remove undefined/null values for update
    const updateData = {};
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] !== undefined && cleanedData[key] !== null) {
        updateData[key] = cleanedData[key];
      }
    });
    
    console.log('Final update data:', updateData);

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: updateData,
      include: {
        seller: true,
        assignedAgent: true,
        tenants: true,
        buyers: true
      }
    });

    console.log('Updated property:', updatedProperty);
    res.json(updatedProperty);

  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ 
      error: 'Failed to update property',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = parseInt(id);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Delete related records first (if needed)
    await prisma.task.deleteMany({
      where: { propertyId: propertyId }
    });

    // Delete the property
    await prisma.property.delete({
      where: { id: propertyId }
    });

    res.json({ 
      message: 'Property deleted successfully',
      deletedId: propertyId 
    });

  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ 
      error: 'Failed to delete property',
      details: error.message 
    });
  }
});

// PUT /api/properties/:id/archive - Archive property
router.put('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = parseInt(id);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { 
        status: 'archived',
        archivedAt: new Date()
      },
      include: {
        seller: true,
        assignedAgent: true,
        tenants: true,
        buyers: true
      }
    });

    res.json(updatedProperty);

  } catch (error) {
    console.error('Error archiving property:', error);
    res.status(500).json({ 
      error: 'Failed to archive property',
      details: error.message 
    });
  }
});

// PUT /api/properties/:id/unarchive - Unarchive property
router.put('/:id/unarchive', async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = parseInt(id);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { 
        status: 'available',
        archivedAt: null
      },
      include: {
        seller: true,
        assignedAgent: true,
        tenants: true,
        buyers: true
      }
    });

    res.json(updatedProperty);

  } catch (error) {
    console.error('Error unarchiving property:', error);
    res.status(500).json({ 
      error: 'Failed to unarchive property',
      details: error.message 
    });
  }
});

// PUT /api/properties/:id/assign-buyer - Assign buyer to property
router.put('/:id/assign-buyer', async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerId, type = 'buyer' } = req.body; // type: 'buyer' | 'tenant'
    const propertyId = parseInt(id);
    const buyerIdInt = parseInt(buyerId);
    
    if (isNaN(propertyId) || isNaN(buyerIdInt)) {
      return res.status(400).json({ error: 'Invalid property or buyer ID' });
    }

    // Check if buyer exists
    const buyer = await prisma.buyer.findUnique({
      where: { id: buyerIdInt }
    });

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    let updateData = {};
    
    if (type === 'tenant') {
      // Add tenant relationship
      await prisma.tenant.create({
        data: {
          propertyId: propertyId,
          firstName: buyer.firstName,
          lastName: buyer.lastName,
          phone: buyer.phone,
          email: buyer.email,
          leaseStart: new Date(),
          // leaseEnd will be set separately
        }
      });
      
      updateData = { status: 'rented' };
    } else {
      // Property sold - update buyer status
      await prisma.buyer.update({
        where: { id: buyerIdInt },
        data: { status: 'converted' }
      });
      
      updateData = { 
        status: 'sold',
        soldAt: new Date(),
        soldToBuyerId: buyerIdInt
      };
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: updateData,
      include: {
        seller: true,
        assignedAgent: true,
        tenants: true,
        buyers: true
      }
    });

    res.json(updatedProperty);

  } catch (error) {
    console.error('Error assigning buyer to property:', error);
    res.status(500).json({ 
      error: 'Failed to assign buyer to property',
      details: error.message 
    });
  }
});

// PUT /api/properties/:id/assign-seller - Assign seller to property
router.put('/:id/assign-seller', async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerId } = req.body;
    const propertyId = parseInt(id);
    const sellerIdInt = parseInt(sellerId);
    
    if (isNaN(propertyId) || isNaN(sellerIdInt)) {
      return res.status(400).json({ error: 'Invalid property or seller ID' });
    }

    // Check if seller exists
    const seller = await prisma.seller.findUnique({
      where: { id: sellerIdInt }
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { sellerId: sellerIdInt },
      include: {
        seller: true,
        assignedAgent: true,
        tenants: true,
        buyers: true
      }
    });

    res.json(updatedProperty);

  } catch (error) {
    console.error('Error assigning seller to property:', error);
    res.status(500).json({ 
      error: 'Failed to assign seller to property',
      details: error.message 
    });
  }
});

// PUT /api/properties/:id/viewings - Increment property viewings
router.put('/:id/viewings', async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = parseInt(id);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { 
        viewings: { increment: 1 },
        lastViewing: new Date()
      },
      include: {
        seller: true,
        assignedAgent: true,
        tenants: true,
        buyers: true
      }
    });

    res.json(updatedProperty);

  } catch (error) {
    console.error('Error updating property viewings:', error);
    res.status(500).json({ 
      error: 'Failed to update property viewings',
      details: error.message 
    });
  }
});

module.exports = router;