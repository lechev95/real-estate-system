// backend/routes/sellers.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/sellers - Get all sellers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              propertyType: true,
              status: true,
              priceEur: true,
              monthlyRentEur: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.seller.count()
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json({ sellers, pagination });
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
        properties: {
          include: {
            tenants: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                monthlyRent: true,
                contractStart: true
              }
            }
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
    res.status(500).json({ error: 'Failed to fetch seller' });
  }
});

// POST /api/sellers - Create new seller
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      notes
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

    const sellerData = {
      firstName,
      lastName,
      phone,
      email: email || null,
      address: address || null,
      notes: notes || ''
    };

    const seller = await prisma.seller.create({
      data: sellerData,
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            propertyType: true,
            status: true,
            priceEur: true,
            monthlyRentEur: true
          }
        }
      }
    });

    res.status(201).json(seller);
  } catch (error) {
    console.error('Error creating seller:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    res.status(500).json({ error: 'Failed to create seller' });
  }
});

// PUT /api/sellers/:id - Update seller
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate email format if provided
    if (updateData.email && !updateData.email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const seller = await prisma.seller.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            propertyType: true,
            status: true,
            priceEur: true,
            monthlyRentEur: true
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
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    res.status(500).json({ error: 'Failed to update seller' });
  }
});

// DELETE /api/sellers/:id - Delete seller
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if seller exists and has properties
    const seller = await prisma.seller.findUnique({
      where: { id: parseInt(id) },
      include: { properties: true }
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Check if seller has active properties
    if (seller.properties.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete seller with existing properties. Please reassign or delete properties first.' 
      });
    }

    // Delete the seller
    await prisma.seller.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Seller deleted successfully' });
  } catch (error) {
    console.error('Error deleting seller:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Seller not found' });
    }
    res.status(500).json({ error: 'Failed to delete seller' });
  }
});

module.exports = router;