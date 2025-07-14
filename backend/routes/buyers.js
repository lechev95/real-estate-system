const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/buyers - Get all buyers
router.get('/', async (req, res) => {
  try {
    const {
      status,
      source,
      propertyType,
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build where clause
    const where = {};
    
    if (status) where.status = status;
    if (source) where.source = source;
    if (propertyType) where.propertyType = propertyType;
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

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
          },
          tasks: {
            where: { status: 'pending' },
            select: {
              id: true,
              title: true,
              dueDate: true,
              priority: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
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
            email: true,
            phone: true
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            dueTime: true,
            priority: true,
            status: true,
            taskType: true
          },
          orderBy: { dueDate: 'asc' }
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
router.post('/', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const buyer = await prisma.buyer.create({
      data: {
        ...req.body,
        budgetMin: req.body.budgetMin ? parseFloat(req.body.budgetMin) : null,
        budgetMax: req.body.budgetMax ? parseFloat(req.body.budgetMax) : null,
        roomsMin: req.body.roomsMin ? parseInt(req.body.roomsMin) : null,
        roomsMax: req.body.roomsMax ? parseInt(req.body.roomsMax) : null,
        assignedAgentId: req.body.assignedAgentId ? parseInt(req.body.assignedAgentId) : null,
      },
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(buyer);
  } catch (error) {
    console.error('Error creating buyer:', error);
    res.status(500).json({ error: 'Failed to create buyer' });
  }
});

// PUT /api/buyers/:id - Update buyer
router.put('/:id', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    const buyer = await prisma.buyer.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body,
        budgetMin: req.body.budgetMin ? parseFloat(req.body.budgetMin) : null,
        budgetMax: req.body.budgetMax ? parseFloat(req.body.budgetMax) : null,
        roomsMin: req.body.roomsMin ? parseInt(req.body.roomsMin) : null,
        roomsMax: req.body.roomsMax ? parseInt(req.body.roomsMax) : null,
        assignedAgentId: req.body.assignedAgentId ? parseInt(req.body.assignedAgentId) : null,
        updatedAt: new Date()
      },
      include: {
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
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
    res.status(500).json({ error: 'Failed to update buyer' });
  }
});

// DELETE /api/buyers/:id - Archive buyer (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const buyer = await prisma.buyer.update({
      where: { id: parseInt(id) },
      data: {
        status: 'inactive',
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Buyer archived successfully', buyer });
  } catch (error) {
    console.error('Error archiving buyer:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    res.status(500).json({ error: 'Failed to archive buyer' });
  }
});

module.exports = router;