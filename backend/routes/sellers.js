const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/sellers - Get all sellers
router.get('/', async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build where clause
    const where = {};
    
    if (status) where.status = status;
    
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

    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
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
          properties: {
            select: {
              id: true,
              title: true,
              propertyType: true,
              status: true,
              priceEur: true,
              monthlyRentEur: true
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
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

// GET /api/sellers/:id - Get single seller
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const seller = await prisma.seller.findUnique({
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
        properties: {
          select: {
            id: true,
            title: true,
            propertyType: true,
            category: true,
            address: true,
            district: true,
            area: true,
            rooms: true,
            status: true,
            priceEur: true,
            monthlyRentEur: true,
            viewings: true,
            lastViewing: true
          },
          orderBy: { createdAt: 'desc' }
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

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json(seller);
  } catch (error) {
    console.error('Error fetching seller:', error);
    res.status(500).json({ error: 'Failed to fetch seller' });
  }
});

// POST /api/sellers - Create new seller
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

    const seller = await prisma.seller.create({
      data: {
        ...req.body,
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

    res.status(201).json(seller);
  } catch (error) {
    console.error('Error creating seller:', error);
    res.status(500).json({ error: 'Failed to create seller' });
  }
});

// PUT /api/sellers/:id - Update seller
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
    
    const seller = await prisma.seller.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body,
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

    res.json(seller);
  } catch (error) {
    console.error('Error updating seller:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Seller not found' });
    }
    res.status(500).json({ error: 'Failed to update seller' });
  }
});

// DELETE /api/sellers/:id - Archive seller (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const seller = await prisma.seller.update({
      where: { id: parseInt(id) },
      data: {
        status: 'inactive',
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Seller archived successfully', seller });
  } catch (error) {
    console.error('Error archiving seller:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Seller not found' });
    }
    res.status(500).json({ error: 'Failed to archive seller' });
  }
});

module.exports = router;