const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateProperty = [
  body('title').notEmpty().withMessage('Title is required'),
  body('propertyType').isIn(['sale', 'rent', 'managed']).withMessage('Invalid property type'),
  body('category').isIn(['apartment', 'house', 'office']).withMessage('Invalid category'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('district').notEmpty().withMessage('District is required'),
  body('area').isInt({ min: 1 }).withMessage('Area must be positive integer'),
  body('rooms').isInt({ min: 1 }).withMessage('Rooms must be positive integer'),
];

// GET /api/properties - Get all properties with filtering
router.get('/', async (req, res) => {
  try {
    const {
      type,        // sale, rent, managed
      category,    // apartment, house, office
      district,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      rooms,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const where = {};
    
    if (type) where.propertyType = type;
    if (category) where.category = category;
    if (district) where.district = { contains: district, mode: 'insensitive' };
    if (status) where.status = status;
    if (rooms) where.rooms = parseInt(rooms);
    
    // Price filtering (works for both sale and rent)
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      
      where.OR = [
        { priceEur: priceFilter },
        { monthlyRentEur: priceFilter }
      ];
    }
    
    // Area filtering
    if (minArea || maxArea) {
      const areaFilter = {};
      if (minArea) areaFilter.gte = parseInt(minArea);
      if (maxArea) areaFilter.lte = parseInt(maxArea);
      where.area = areaFilter;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Execute query
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
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
            where: { status: 'active' },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              contractStart: true,
              monthlyRent: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take
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
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            notes: true
          }
        },
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        tenants: {
          where: { status: 'active' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            contractStart: true,
            contractEnd: true,
            deposit: true,
            monthlyRent: true
          }
        },
        tasks: {
          where: { status: { not: 'completed' } },
          select: {
            id: true,
            title: true,
            dueDate: true,
            priority: true,
            status: true
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
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// POST /api/properties - Create new property
router.post('/', validateProperty, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const property = await prisma.property.create({
      data: {
        ...req.body,
        area: parseInt(req.body.area),
        rooms: parseInt(req.body.rooms),
        floor: req.body.floor ? parseInt(req.body.floor) : null,
        totalFloors: req.body.totalFloors ? parseInt(req.body.totalFloors) : null,
        yearBuilt: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : null,
        priceEur: req.body.priceEur ? parseFloat(req.body.priceEur) : null,
        pricePerSqm: req.body.pricePerSqm ? parseFloat(req.body.pricePerSqm) : null,
        monthlyRentEur: req.body.monthlyRentEur ? parseFloat(req.body.monthlyRentEur) : null,
        managementFeePercent: req.body.managementFeePercent ? parseFloat(req.body.managementFeePercent) : null,
        sellerId: req.body.sellerId ? parseInt(req.body.sellerId) : null,
        assignedAgentId: req.body.assignedAgentId ? parseInt(req.body.assignedAgentId) : null,
      },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', validateProperty, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body,
        area: parseInt(req.body.area),
        rooms: parseInt(req.body.rooms),
        floor: req.body.floor ? parseInt(req.body.floor) : null,
        totalFloors: req.body.totalFloors ? parseInt(req.body.totalFloors) : null,
        yearBuilt: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : null,
        priceEur: req.body.priceEur ? parseFloat(req.body.priceEur) : null,
        pricePerSqm: req.body.pricePerSqm ? parseFloat(req.body.pricePerSqm) : null,
        monthlyRentEur: req.body.monthlyRentEur ? parseFloat(req.body.monthlyRentEur) : null,
        managementFeePercent: req.body.managementFeePercent ? parseFloat(req.body.managementFeePercent) : null,
        sellerId: req.body.sellerId ? parseInt(req.body.sellerId) : null,
        assignedAgentId: req.body.assignedAgentId ? parseInt(req.body.assignedAgentId) : null,
        updatedAt: new Date()
      },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.property.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// POST /api/properties/:id/viewing - Record a viewing
router.post('/:id/viewing', async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data: {
        viewings: { increment: 1 },
        lastViewing: new Date()
      }
    });

    res.json({ 
      message: 'Viewing recorded successfully',
      viewings: property.viewings,
      lastViewing: property.lastViewing
    });
  } catch (error) {
    console.error('Error recording viewing:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.status(500).json({ error: 'Failed to record viewing' });
  }
});

module.exports = router;