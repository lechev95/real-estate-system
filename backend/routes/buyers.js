// backend/routes/buyers.js - COMPLETE BUYERS ROUTES
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to clean buyer data
const cleanBuyerData = (data) => {
  const cleaned = {};
  
  // Required fields
  if (data.firstName) cleaned.firstName = data.firstName.toString().trim();
  if (data.lastName) cleaned.lastName = data.lastName.toString().trim();
  if (data.phone) cleaned.phone = data.phone.toString().trim();
  
  // Optional fields
  if (data.email && typeof data.email === 'string') {
    cleaned.email = data.email.trim();
  }
  
  // Budget fields
  if (data.budgetMin !== undefined && data.budgetMin !== null && data.budgetMin !== '') {
    const budget = parseFloat(data.budgetMin);
    if (!isNaN(budget) && budget >= 0) cleaned.budgetMin = budget.toString();
  }
  
  if (data.budgetMax !== undefined && data.budgetMax !== null && data.budgetMax !== '') {
    const budget = parseFloat(data.budgetMax);
    if (!isNaN(budget) && budget >= 0) cleaned.budgetMax = budget.toString();
  }
  
  // Other fields
  cleaned.status = data.status?.toString() || 'potential';
  cleaned.preferredPropertyType = data.preferredPropertyType?.toString() || 'any';
  
  if (data.preferredRooms !== undefined && data.preferredRooms !== null && data.preferredRooms !== '') {
    const rooms = parseInt(data.preferredRooms);
    if (!isNaN(rooms) && rooms > 0) cleaned.preferredRooms = rooms;
  }
  
  if (data.notes && typeof data.notes === 'string') {
    cleaned.notes = data.notes.trim();
  }
  
  // Handle preferredAreas array
  if (data.preferredAreas) {
    if (Array.isArray(data.preferredAreas)) {
      cleaned.preferredAreas = data.preferredAreas.filter(area => area && area.trim());
    } else if (typeof data.preferredAreas === 'string') {
      cleaned.preferredAreas = data.preferredAreas.split(',').map(area => area.trim()).filter(area => area);
    }
  }
  
  // ID fields
  if (data.assignedAgentId !== undefined && data.assignedAgentId !== null && data.assignedAgentId !== '') {
    const id = parseInt(data.assignedAgentId);
    if (!isNaN(id) && id > 0) cleaned.assignedAgentId = id;
  }
  
  return cleaned;
};

// GET /api/buyers - Get all buyers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, propertyType, agentId, minBudget, maxBudget } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (propertyType && propertyType !== 'all') where.preferredPropertyType = propertyType;
    if (agentId) where.assignedAgentId = parseInt(agentId);
    
    // Budget filters
    if (minBudget) {
      where.budgetMax = { gte: parseFloat(minBudget).toString() };
    }
    if (maxBudget) {
      where.budgetMin = { lte: parseFloat(maxBudget).toString() };
    }
    
    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
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
          viewedProperties: {
            select: {
              id: true,
              title: true,
              address: true,
              propertyType: true,
              priceEur: true,
              monthlyRentEur: true
            },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.buyer.count({ where })
    ]);

    res.json({
      buyers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching buyers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch buyers',
      details: error.message 
    });
  }
});

// GET /api/buyers/:id - Get buyer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = parseInt(id);
    
    if (isNaN(buyerId)) {
      return res.status(400).json({ error: 'Invalid buyer ID' });
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id: buyerId },
      include: {
        assignedAgent: true,
        viewedProperties: {
          include: {
            seller: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        tasks: {
          include: {
            assignedAgent: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    res.json(buyer);

  } catch (error) {
    console.error('Error fetching buyer:', error);
    res.status(500).json({ 
      error: 'Failed to fetch buyer',
      details: error.message 
    });
  }
});

// POST /api/buyers - Create new buyer
router.post('/', async (req, res) => {
  try {
    console.log('Creating buyer with data:', req.body);
    
    const cleanedData = cleanBuyerData(req.body);
    console.log('Cleaned buyer data:', cleanedData);
    
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
    
    // Budget validation
    if (cleanedData.budgetMin && cleanedData.budgetMax && 
        parseFloat(cleanedData.budgetMin) > parseFloat(cleanedData.budgetMax)) {
      return res.status(400).json({ error: 'Minimum budget cannot be greater than maximum budget' });
    }
    
    // Check for duplicate phone
    const existingBuyer = await prisma.buyer.findFirst({
      where: { phone: cleanedData.phone }
    });
    
    if (existingBuyer) {
      return res.status(400).json({ error: 'Buyer with this phone number already exists' });
    }

    const newBuyer = await prisma.buyer.create({
      data: cleanedData,
      include: {
        assignedAgent: true
      }
    });

    console.log('Created buyer:', newBuyer);
    res.status(201).json(newBuyer);

  } catch (error) {
    console.error('Error creating buyer:', error);
    res.status(500).json({ 
      error: 'Failed to create buyer',
      details: error.message 
    });
  }
});

// PUT /api/buyers/:id - Update buyer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = parseInt(id);
    
    console.log(`Updating buyer ${buyerId} with data:`, req.body);
    
    if (isNaN(buyerId)) {
      return res.status(400).json({ error: 'Invalid buyer ID' });
    }

    // Check if buyer exists
    const existingBuyer = await prisma.buyer.findUnique({
      where: { id: buyerId }
    });

    if (!existingBuyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    const cleanedData = cleanBuyerData(req.body);
    console.log('Cleaned update data:', cleanedData);
    
    // Email validation for updates
    if (cleanedData.email && !cleanedData.email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Budget validation
    if (cleanedData.budgetMin && cleanedData.budgetMax && 
        parseFloat(cleanedData.budgetMin) > parseFloat(cleanedData.budgetMax)) {
      return res.status(400).json({ error: 'Minimum budget cannot be greater than maximum budget' });
    }
    
    // Check for duplicate phone (excluding current buyer)
    if (cleanedData.phone && cleanedData.phone !== existingBuyer.phone) {
      const duplicateBuyer = await prisma.buyer.findFirst({
        where: { 
          phone: cleanedData.phone,
          id: { not: buyerId }
        }
      });
      
      if (duplicateBuyer) {
        return res.status(400).json({ error: 'Another buyer with this phone number already exists' });
      }
    }
    
    // Remove undefined/null values for update
    const updateData = {};
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] !== undefined && cleanedData[key] !== null) {
        updateData[key] = cleanedData[key];
      }
    });
    
    console.log('Final update data:', updateData);

    const updatedBuyer = await prisma.buyer.update({
      where: { id: buyerId },
      data: updateData,
      include: {
        assignedAgent: true,
        viewedProperties: true
      }
    });

    console.log('Updated buyer:', updatedBuyer);
    res.json(updatedBuyer);

  } catch (error) {
    console.error('Error updating buyer:', error);
    res.status(500).json({ 
      error: 'Failed to update buyer',
      details: error.message 
    });
  }
});

// DELETE /api/buyers/:id - Delete buyer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = parseInt(id);
    
    if (isNaN(buyerId)) {
      return res.status(400).json({ error: 'Invalid buyer ID' });
    }

    // Check if buyer exists
    const existingBuyer = await prisma.buyer.findUnique({
      where: { id: buyerId }
    });

    if (!existingBuyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Delete related tasks first
    await prisma.task.deleteMany({
      where: { buyerId: buyerId }
    });

    // Delete the buyer
    await prisma.buyer.delete({
      where: { id: buyerId }
    });

    res.json({ 
      message: 'Buyer deleted successfully',
      deletedId: buyerId 
    });

  } catch (error) {
    console.error('Error deleting buyer:', error);
    res.status(500).json({ 
      error: 'Failed to delete buyer',
      details: error.message 
    });
  }
});

// PUT /api/buyers/:id/archive - Archive buyer
router.put('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = parseInt(id);
    
    if (isNaN(buyerId)) {
      return res.status(400).json({ error: 'Invalid buyer ID' });
    }

    const updatedBuyer = await prisma.buyer.update({
      where: { id: buyerId },
      data: { 
        status: 'archived',
        archivedAt: new Date()
      },
      include: {
        assignedAgent: true
      }
    });

    res.json(updatedBuyer);

  } catch (error) {
    console.error('Error archiving buyer:', error);
    res.status(500).json({ 
      error: 'Failed to archive buyer',
      details: error.message 
    });
  }
});

// PUT /api/buyers/:id/assign-agent - Assign agent to buyer
router.put('/:id/assign-agent', async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    const buyerId = parseInt(id);
    const agentIdInt = parseInt(agentId);
    
    if (isNaN(buyerId) || isNaN(agentIdInt)) {
      return res.status(400).json({ error: 'Invalid buyer or agent ID' });
    }

    // Check if agent exists
    const agent = await prisma.user.findUnique({
      where: { id: agentIdInt }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const updatedBuyer = await prisma.buyer.update({
      where: { id: buyerId },
      data: { assignedAgentId: agentIdInt },
      include: {
        assignedAgent: true
      }
    });

    res.json(updatedBuyer);

  } catch (error) {
    console.error('Error assigning agent to buyer:', error);
    res.status(500).json({ 
      error: 'Failed to assign agent to buyer',
      details: error.message 
    });
  }
});

// POST /api/buyers/:id/viewed-properties - Add viewed property
router.post('/:id/viewed-properties', async (req, res) => {
  try {
    const { id } = req.params;
    const { propertyId } = req.body;
    const buyerId = parseInt(id);
    const propertyIdInt = parseInt(propertyId);
    
    if (isNaN(buyerId) || isNaN(propertyIdInt)) {
      return res.status(400).json({ error: 'Invalid buyer or property ID' });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyIdInt }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Create viewing record
    const viewing = await prisma.propertyViewing.create({
      data: {
        buyerId: buyerId,
        propertyId: propertyIdInt,
        viewedAt: new Date()
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            propertyType: true,
            priceEur: true,
            monthlyRentEur: true
          }
        }
      }
    });

    // Increment property viewings
    await prisma.property.update({
      where: { id: propertyIdInt },
      data: { 
        viewings: { increment: 1 },
        lastViewing: new Date()
      }
    });

    res.status(201).json(viewing);

  } catch (error) {
    console.error('Error adding viewed property:', error);
    res.status(500).json({ 
      error: 'Failed to add viewed property',
      details: error.message 
    });
  }
});

// GET /api/buyers/:id/matching-properties - Get matching properties for buyer
router.get('/:id/matching-properties', async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = parseInt(id);
    
    if (isNaN(buyerId)) {
      return res.status(400).json({ error: 'Invalid buyer ID' });
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id: buyerId }
    });

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Build matching criteria
    const where = {
      status: 'available'
    };

    // Property type matching
    if (buyer.preferredPropertyType && buyer.preferredPropertyType !== 'any') {
      where.propertyType = buyer.preferredPropertyType;
    }

    // Budget matching
    if (buyer.budgetMax) {
      if (buyer.preferredPropertyType === 'sale') {
        where.priceEur = { lte: buyer.budgetMax };
      } else {
        where.monthlyRentEur = { lte: buyer.budgetMax };
      }
    }

    // Room preferences
    if (buyer.preferredRooms) {
      where.rooms = buyer.preferredRooms;
    }

    // Area preferences
    if (buyer.preferredAreas && buyer.preferredAreas.length > 0) {
      where.OR = buyer.preferredAreas.map(area => ({
        OR: [
          { city: { contains: area, mode: 'insensitive' } },
          { district: { contains: area, mode: 'insensitive' } }
        ]
      }));
    }

    const matchingProperties = await prisma.property.findMany({
      where,
      include: {
        seller: {
          select: { firstName: true, lastName: true, phone: true }
        },
        assignedAgent: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({
      buyerId,
      criteria: {
        propertyType: buyer.preferredPropertyType,
        maxBudget: buyer.budgetMax,
        preferredRooms: buyer.preferredRooms,
        preferredAreas: buyer.preferredAreas
      },
      matches: matchingProperties,
      count: matchingProperties.length
    });

  } catch (error) {
    console.error('Error finding matching properties:', error);
    res.status(500).json({ 
      error: 'Failed to find matching properties',
      details: error.message 
    });
  }
});

// GET /api/buyers/stats - Get buyer statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [
      totalBuyers,
      activeBuyers,
      potentialBuyers,
      convertedBuyers,
      inactiveBuyers,
      buyersByType,
      averageBudget
    ] = await Promise.all([
      prisma.buyer.count(),
      prisma.buyer.count({ where: { status: 'active' } }),
      prisma.buyer.count({ where: { status: 'potential' } }),
      prisma.buyer.count({ where: { status: 'converted' } }),
      prisma.buyer.count({ where: { status: 'inactive' } }),
      
      prisma.buyer.groupBy({
        by: ['preferredPropertyType'],
        _count: { id: true }
      }),
      
      prisma.buyer.aggregate({
        _avg: { budgetMax: true },
        where: { budgetMax: { not: null } }
      })
    ]);

    res.json({
      total: totalBuyers,
      byStatus: {
        active: activeBuyers,
        potential: potentialBuyers,
        converted: convertedBuyers,
        inactive: inactiveBuyers
      },
      byType: buyersByType.reduce((acc, item) => {
        acc[item.preferredPropertyType || 'any'] = item._count.id;
        return acc;
      }, {}),
      averageBudget: averageBudget._avg.budgetMax ? Math.round(parseFloat(averageBudget._avg.budgetMax)) : null,
      conversionRate: totalBuyers > 0 ? Math.round((convertedBuyers / totalBuyers) * 100) : 0
    });

  } catch (error) {
    console.error('Error fetching buyer statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch buyer statistics',
      details: error.message 
    });
  }
});

module.exports = router;