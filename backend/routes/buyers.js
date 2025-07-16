// backend/routes/buyers.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/buyers - Get all buyers with filters
router.get('/', async (req, res) => {
  try {
    const { status, minBudget, maxBudget, city, page = 1, limit = 20 } = req.query;
    
    const where = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (city) {
      where.preferredAreas = { has: city };
    }
    
    if (minBudget || maxBudget) {
      where.AND = [];
      if (minBudget) {
        where.AND.push({ budgetMin: { gte: minBudget } });
      }
      if (maxBudget) {
        where.AND.push({ budgetMax: { lte: maxBudget } });
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        include: {
          assignedAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.buyer.count({ where })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json({ buyers, pagination });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch buyers',
      details: error.message 
    });
  }
});

// GET /api/buyers/:id - Get single buyer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid buyer ID' });
    }
    
    const buyer = await prisma.buyer.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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
    const {
      firstName,
      lastName,
      phone,
      email,
      budgetMin,
      budgetMax,
      preferredPropertyType,
      preferredAreas,
      preferredRooms,
      notes,
      status = 'potential',
      assignedAgentId
    } = req.body;

    console.log('Creating buyer with data:', req.body);

    // Enhanced validation
    const errors = [];
    
    if (!firstName || firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!lastName || lastName.trim().length === 0) {
      errors.push('Last name is required');
    }
    
    if (!phone || phone.trim().length === 0) {
      errors.push('Phone is required');
    }

    // Validate email format if provided
    if (email && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Invalid email format');
      }
    }

    // Validate budget range
    if (budgetMin && budgetMax) {
      const minVal = parseFloat(budgetMin);
      const maxVal = parseFloat(budgetMax);
      if (!isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
        errors.push('budgetMin cannot be greater than budgetMax');
      }
    }

    // Validate status
    if (status && !['potential', 'active', 'inactive', 'converted'].includes(status)) {
      errors.push('Invalid status value');
    }

    // Validate property type preference
    if (preferredPropertyType && !['any', 'sale', 'rent'].includes(preferredPropertyType)) {
      errors.push('Invalid preferred property type');
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors 
      });
    }

    // Prepare data for database
    const buyerData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email && email.trim().length > 0 ? email.trim() : null,
      budgetMin: budgetMin && !isNaN(parseFloat(budgetMin)) ? parseFloat(budgetMin).toString() : null,
      budgetMax: budgetMax && !isNaN(parseFloat(budgetMax)) ? parseFloat(budgetMax).toString() : null,
      preferredPropertyType: preferredPropertyType || 'any',
      preferredAreas: Array.isArray(preferredAreas) ? preferredAreas.filter(area => area && area.trim()) : [],
      preferredRooms: preferredRooms && !isNaN(parseInt(preferredRooms)) ? parseInt(preferredRooms) : null,
      notes: notes ? notes.trim() : '',
      status: status || 'potential',
      assignedAgentId: assignedAgentId && !isNaN(parseInt(assignedAgentId)) ? parseInt(assignedAgentId) : 1, // Default to first agent
      lastContact: new Date()
    };

    console.log('Processed buyer data:', buyerData);

    const buyer = await prisma.buyer.create({
      data: buyerData,
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('Created buyer:', buyer.id);
    res.status(201).json(buyer);
  } catch (error) {
    console.error('Error creating buyer:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Phone number already exists',
        details: 'This phone number is already registered for another buyer' 
      });
    }
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
    const updateData = { ...req.body };

    console.log('Updating buyer', id, 'with data:', updateData);

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid buyer ID' });
    }

    // Check if buyer exists
    const existingBuyer = await prisma.buyer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingBuyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Validate and clean data
    const cleanData = {};
    
    if (updateData.firstName !== undefined) {
      if (!updateData.firstName || updateData.firstName.trim().length === 0) {
        return res.status(400).json({ error: 'First name cannot be empty' });
      }
      cleanData.firstName = updateData.firstName.trim();
    }

    if (updateData.lastName !== undefined) {
      if (!updateData.lastName || updateData.lastName.trim().length === 0) {
        return res.status(400).json({ error: 'Last name cannot be empty' });
      }
      cleanData.lastName = updateData.lastName.trim();
    }

    if (updateData.phone !== undefined) {
      if (!updateData.phone || updateData.phone.trim().length === 0) {
        return res.status(400).json({ error: 'Phone cannot be empty' });
      }
      cleanData.phone = updateData.phone.trim();
    }

    if (updateData.email !== undefined) {
      if (updateData.email && updateData.email.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email.trim())) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
        cleanData.email = updateData.email.trim();
      } else {
        cleanData.email = null;
      }
    }

    if (updateData.budgetMin !== undefined) {
      if (updateData.budgetMin && (isNaN(parseFloat(updateData.budgetMin)) || parseFloat(updateData.budgetMin) < 0)) {
        return res.status(400).json({ error: 'Invalid minimum budget' });
      }
      cleanData.budgetMin = updateData.budgetMin && !isNaN(parseFloat(updateData.budgetMin)) ? parseFloat(updateData.budgetMin).toString() : null;
    }

    if (updateData.budgetMax !== undefined) {
      if (updateData.budgetMax && (isNaN(parseFloat(updateData.budgetMax)) || parseFloat(updateData.budgetMax) < 0)) {
        return res.status(400).json({ error: 'Invalid maximum budget' });
      }
      cleanData.budgetMax = updateData.budgetMax && !isNaN(parseFloat(updateData.budgetMax)) ? parseFloat(updateData.budgetMax).toString() : null;
    }

    // Validate budget range
    if ((cleanData.budgetMin !== undefined || cleanData.budgetMax !== undefined)) {
      const minVal = cleanData.budgetMin !== undefined ? cleanData.budgetMin : existingBuyer.budgetMin;
      const maxVal = cleanData.budgetMax !== undefined ? cleanData.budgetMax : existingBuyer.budgetMax;
      
      if (minVal && maxVal && parseFloat(minVal) > parseFloat(maxVal)) {
        return res.status(400).json({ error: 'budgetMin cannot be greater than budgetMax' });
      }
    }

    if (updateData.preferredPropertyType !== undefined) {
      if (!['any', 'sale', 'rent'].includes(updateData.preferredPropertyType)) {
        return res.status(400).json({ error: 'Invalid preferred property type' });
      }
      cleanData.preferredPropertyType = updateData.preferredPropertyType;
    }

    if (updateData.preferredAreas !== undefined) {
      cleanData.preferredAreas = Array.isArray(updateData.preferredAreas) ? 
        updateData.preferredAreas.filter(area => area && area.trim()) : [];
    }

    if (updateData.preferredRooms !== undefined) {
      if (updateData.preferredRooms && (isNaN(parseInt(updateData.preferredRooms)) || parseInt(updateData.preferredRooms) < 1)) {
        return res.status(400).json({ error: 'Invalid preferred rooms' });
      }
      cleanData.preferredRooms = updateData.preferredRooms && !isNaN(parseInt(updateData.preferredRooms)) ? parseInt(updateData.preferredRooms) : null;
    }

    if (updateData.status !== undefined) {
      if (!['potential', 'active', 'inactive', 'converted'].includes(updateData.status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      cleanData.status = updateData.status;
    }

    if (updateData.notes !== undefined) {
      cleanData.notes = updateData.notes ? updateData.notes.trim() : '';
    }

    if (updateData.assignedAgentId !== undefined) {
      cleanData.assignedAgentId = updateData.assignedAgentId && !isNaN(parseInt(updateData.assignedAgentId)) ? parseInt(updateData.assignedAgentId) : null;
    }

    // Update last contact date if status or notes changed
    if (cleanData.status !== undefined || cleanData.notes !== undefined) {
      cleanData.lastContact = new Date();
    }

    console.log('Clean data for update:', cleanData);

    const buyer = await prisma.buyer.update({
      where: { id: parseInt(id) },
      data: cleanData,
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('Updated buyer:', buyer.id);
    res.json(buyer);
  } catch (error) {
    console.error('Error updating buyer:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Phone number already exists',
        details: 'This phone number is already registered for another buyer' 
      });
    }
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

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid buyer ID' });
    }

    // Check if buyer exists
    const buyer = await prisma.buyer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Delete the buyer
    await prisma.buyer.delete({
      where: { id: parseInt(id) }
    });

    console.log('Deleted buyer:', id);
    res.json({ message: 'Buyer deleted successfully' });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    res.status(500).json({ 
      error: 'Failed to delete buyer',
      details: error.message 
    });
  }
});

// PATCH /api/buyers/:id/contact - Update last contact date
router.patch('/:id/contact', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid buyer ID' });
    }

    const updateData = {
      lastContact: new Date()
    };

    if (notes !== undefined) {
      updateData.notes = notes ? notes.trim() : '';
    }

    const buyer = await prisma.buyer.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json(buyer);
  } catch (error) {
    console.error('Error updating contact:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    res.status(500).json({ 
      error: 'Failed to update contact',
      details: error.message 
    });
  }
});

// PATCH /api/buyers/:id/status - Update buyer status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid buyer ID' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['potential', 'active', 'inactive', 'converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updateData = {
      status,
      lastContact: new Date()
    };

    if (notes !== undefined) {
      updateData.notes = notes ? notes.trim() : '';
    }

    const buyer = await prisma.buyer.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json(buyer);
  } catch (error) {
    console.error('Error updating status:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    res.status(500).json({ 
      error: 'Failed to update status',
      details: error.message 
    });
  }
});

module.exports = router;