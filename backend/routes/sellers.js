// backend/routes/sellers.js - COMPLETE SELLERS FUNCTIONALITY
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to clean seller data
const cleanSellerData = (data) => {
  const cleaned = {};
  
  // Required fields
  if (data.firstName) cleaned.firstName = data.firstName.toString().trim();
  if (data.lastName) cleaned.lastName = data.lastName.toString().trim();
  if (data.phone) cleaned.phone = data.phone.toString().trim();
  
  // Optional fields
  if (data.email && typeof data.email === 'string') {
    cleaned.email = data.email.trim();
  }
  
  if (data.address && typeof data.address === 'string') {
    cleaned.address = data.address.trim();
  }
  
  if (data.city && typeof data.city === 'string') {
    cleaned.city = data.city.trim();
  }
  
  if (data.notes && typeof data.notes === 'string') {
    cleaned.notes = data.notes.trim();
  }
  
  // Status field
  cleaned.status = data.status?.toString() || 'active';
  
  // ID fields
  if (data.assignedAgentId !== undefined && data.assignedAgentId !== null && data.assignedAgentId !== '') {
    const id = parseInt(data.assignedAgentId);
    if (!isNaN(id) && id > 0) cleaned.assignedAgentId = id;
  }
  
  return cleaned;
};

// GET /api/sellers - Get all sellers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, city, agentId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (agentId) where.assignedAgentId = parseInt(agentId);
    
    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          assignedAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          properties: {
            select: {
              id: true,
              title: true,
              propertyType: true,
              status: true,
              priceEur: true,
              monthlyRentEur: true,
              area: true,
              rooms: true,
              address: true,
              city: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.seller.count({ where })
    ]);

    res.json({
      sellers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sellers',
      details: error.message 
    });
  }
});

// GET /api/sellers/:id - Get seller by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = parseInt(id);
    
    if (isNaN(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        assignedAgent: true,
        properties: {
          include: {
            tenants: true,
            buyers: true
          }
        }
      }
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json(seller);

  } catch (error) {
    console.error('Error fetching seller:', error);
    res.status(500).json({ 
      error: 'Failed to fetch seller',
      details: error.message 
    });
  }
});

// POST /api/sellers - Create new seller
router.post('/', async (req, res) => {
  try {
    console.log('Creating seller with data:', req.body);
    
    const cleanedData = cleanSellerData(req.body);
    console.log('Cleaned seller data:', cleanedData);
    
    // Validation
    if (!cleanedData.firstName) {
      return res.status(400).json({ error: 'First name is required' });
    }
    
    if (!cleanedData.lastName) {
      return res.status(400).json({ error: 'Last name is required' });
    }
    
    if (!cleanedData.phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Email validation
    if (cleanedData.email && !cleanedData.email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Set default values
    if (!cleanedData.city) cleanedData.city = 'София';

    const newSeller = await prisma.seller.create({
      data: cleanedData,
      include: {
        assignedAgent: true,
        properties: true
      }
    });

    console.log('Created seller:', newSeller);
    res.status(201).json(newSeller);

  } catch (error) {
    console.error('Error creating seller:', error);
    res.status(500).json({ 
      error: 'Failed to create seller',
      details: error.message 
    });
  }
});

// PUT /api/sellers/:id - Update seller
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = parseInt(id);
    
    console.log(`Updating seller ${sellerId} with data:`, req.body);
    
    if (isNaN(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    // Check if seller exists
    const existingSeller = await prisma.seller.findUnique({
      where: { id: sellerId }
    });

    if (!existingSeller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const cleanedData = cleanSellerData(req.body);
    console.log('Cleaned update data:', cleanedData);
    
    // Email validation for updates
    if (cleanedData.email && !cleanedData.email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Remove undefined/null values for update
    const updateData = {};
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] !== undefined && cleanedData[key] !== null) {
        updateData[key] = cleanedData[key];
      }
    });
    
    console.log('Final update data:', updateData);

    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: updateData,
      include: {
        assignedAgent: true,
        properties: true
      }
    });

    console.log('Updated seller:', updatedSeller);
    res.json(updatedSeller);

  } catch (error) {
    console.error('Error updating seller:', error);
    res.status(500).json({ 
      error: 'Failed to update seller',
      details: error.message 
    });
  }
});

// DELETE /api/sellers/:id - Delete seller
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = parseInt(id);
    
    if (isNaN(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    // Check if seller exists
    const existingSeller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: { properties: true }
    });

    if (!existingSeller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Check if seller has properties
    if (existingSeller.properties.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete seller with associated properties',
        propertyCount: existingSeller.properties.length
      });
    }

    // Delete the seller
    await prisma.seller.delete({
      where: { id: sellerId }
    });

    res.json({ 
      message: 'Seller deleted successfully',
      deletedId: sellerId 
    });

  } catch (error) {
    console.error('Error deleting seller:', error);
    res.status(500).json({ 
      error: 'Failed to delete seller',
      details: error.message 
    });
  }
});

// PUT /api/sellers/:id/archive - Archive seller
router.put('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = parseInt(id);
    
    if (isNaN(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: { 
        status: 'archived',
        archivedAt: new Date()
      },
      include: {
        assignedAgent: true,
        properties: true
      }
    });

    res.json(updatedSeller);

  } catch (error) {
    console.error('Error archiving seller:', error);
    res.status(500).json({ 
      error: 'Failed to archive seller',
      details: error.message 
    });
  }
});

// PUT /api/sellers/:id/assign-agent - Assign agent to seller
router.put('/:id/assign-agent', async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    const sellerId = parseInt(id);
    const agentIdInt = parseInt(agentId);
    
    if (isNaN(sellerId) || isNaN(agentIdInt)) {
      return res.status(400).json({ error: 'Invalid seller or agent ID' });
    }

    // Check if agent exists
    const agent = await prisma.user.findUnique({
      where: { id: agentIdInt }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: { assignedAgentId: agentIdInt },
      include: {
        assignedAgent: true,
        properties: true
      }
    });

    res.json(updatedSeller);

  } catch (error) {
    console.error('Error assigning agent to seller:', error);
    res.status(500).json({ 
      error: 'Failed to assign agent to seller',
      details: error.message 
    });
  }
});

// GET /api/sellers/:id/properties - Get all properties for a seller
router.get('/:id/properties', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = parseInt(id);
    
    if (isNaN(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    const properties = await prisma.property.findMany({
      where: { sellerId: sellerId },
      include: {
        seller: true,
        assignedAgent: true,
        tenants: true,
        buyers: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      sellerId,
      properties,
      count: properties.length
    });

  } catch (error) {
    console.error('Error fetching seller properties:', error);
    res.status(500).json({ 
      error: 'Failed to fetch seller properties',
      details: error.message 
    });
  }
});

module.exports = router;