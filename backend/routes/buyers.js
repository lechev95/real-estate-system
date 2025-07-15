// backend/routes/buyers.js
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
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

// GET /api/buyers/:id - Get single buyer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
    res.status(500).json({ error: 'Failed to fetch buyer' });
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

    // Validation
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ 
        error: 'Missing required fields: firstName, lastName, phone' 
      });
    }

    // Validate email format if provided
    if (email && !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate budget range
    if (budgetMin && budgetMax && parseFloat(budgetMin) > parseFloat(budgetMax)) {
      return res.status(400).json({ error: 'budgetMin cannot be greater than budgetMax' });
    }

    const buyerData = {
      firstName,
      lastName,
      phone,
      email: email || null,
      budgetMin: budgetMin ? budgetMin.toString() : null,
      budgetMax: budgetMax ? budgetMax.toString() : null,
      preferredPropertyType: preferredPropertyType || 'any',
      preferredAreas: Array.isArray(preferredAreas) ? preferredAreas : (preferredAreas ? [preferredAreas] : []),
      preferredRooms: preferredRooms ? parseInt(preferredRooms) : null,
      notes: notes || '',
      status,
      assignedAgentId: assignedAgentId ? parseInt(assignedAgentId) : 1, // Default to first agent
      lastContact: new Date()
    };

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

    res.status(201).json(buyer);
  } catch (error) {
    console.error('Error creating buyer:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    res.status(500).json({ error: 'Failed to create buyer' });
  }
});

// PUT /api/buyers/:id - Update buyer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert numeric fields
    if (updateData.preferredRooms) updateData.preferredRooms = parseInt(updateData.preferredRooms);
    if (updateData.assignedAgentId) updateData.assignedAgentId = parseInt(updateData.assignedAgentId);

    // Convert string fields
    if (updateData.budgetMin) updateData.budgetMin = updateData.budgetMin.toString();
    if (updateData.budgetMax) updateData.budgetMax.toString();

    // Handle arrays
    if (updateData.preferredAreas && !Array.isArray(updateData.preferredAreas)) {
      updateData.preferredAreas = [updateData.preferredAreas];
    }

    // Validate budget range if both are provided
    if (updateData.budgetMin && updateData.budgetMax) {
      if (parseFloat(updateData.budgetMin) > parseFloat(updateData.budgetMax)) {
        return res.status(400).json({ error: 'budgetMin cannot be greater than budgetMax' });
      }
    }

    // Update last contact date if status or notes changed
    if (updateData.status || updateData.notes) {
      updateData.lastContact = new Date();
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
    console.error('Error updating buyer:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    res.status(500).json({ error: 'Failed to update buyer' });
  }
});

// DELETE /api/buyers/:id - Delete buyer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

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

    res.json({ message: 'Buyer deleted successfully' });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    res.status(500).json({ error: 'Failed to delete buyer' });
  }
});

// PATCH /api/buyers/:id/contact - Update last contact date
router.patch('/:id/contact', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const buyer = await prisma.buyer.update({
      where: { id: parseInt(id) },
      data: {
        lastContact: new Date(),
        ...(notes && { notes })
      },
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
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// PATCH /api/buyers/:id/status - Update buyer status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['potential', 'active', 'inactive', 'converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const buyer = await prisma.buyer.update({
      where: { id: parseInt(id) },
      data: {
        status,
        lastContact: new Date(),
        ...(notes && { notes })
      },
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
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;