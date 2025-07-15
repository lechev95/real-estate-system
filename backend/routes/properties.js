// backend/routes/properties.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/properties - Get all properties with filters
router.get('/', async (req, res) => {
  try {
    const { propertyType, city, district, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    
    const where = {};
    
    if (propertyType && propertyType !== 'all') {
      where.propertyType = propertyType;
    }
    
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    if (district) {
      where.district = { contains: district, mode: 'insensitive' };
    }
    
    if (minPrice || maxPrice) {
      where.OR = [
        // For sale properties
        {
          AND: [
            { propertyType: 'sale' },
            {
              priceEur: {
                ...(minPrice && { gte: minPrice }),
                ...(maxPrice && { lte: maxPrice })
              }
            }
          ]
        },
        // For rent properties
        {
          AND: [
            { propertyType: { in: ['rent', 'managed'] } },
            {
              monthlyRentEur: {
                ...(minPrice && { gte: minPrice }),
                ...(maxPrice && { lte: maxPrice })
              }
            }
          ]
        }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.property.count({ where })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json({ properties, pagination });
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
        tenants: true
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
router.post('/', async (req, res) => {
  try {
    const {
      propertyType,
      category,
      title,
      description,
      address,
      city,
      district,
      area,
      rooms,
      floor,
      totalFloors,
      yearBuilt,
      exposure,
      heating,
      priceEur,
      pricePerSqm,
      monthlyRentEur,
      managementFeePercent,
      rentalConditions,
      status = 'available',
      sellerId,
      assignedAgentId
    } = req.body;

    // Validation
    if (!title || !propertyType || !category || !address || !city || !area || !rooms) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, propertyType, category, address, city, area, rooms' 
      });
    }

    // Additional validation based on property type
    if (propertyType === 'sale' && !priceEur) {
      return res.status(400).json({ error: 'Sale properties require priceEur' });
    }

    if ((propertyType === 'rent' || propertyType === 'managed') && !monthlyRentEur) {
      return res.status(400).json({ error: 'Rental properties require monthlyRentEur' });
    }

    // Calculate price per sqm for sale properties
    let calculatedPricePerSqm = null;
    if (propertyType === 'sale' && priceEur && area) {
      calculatedPricePerSqm = Math.round(parseFloat(priceEur) / parseFloat(area)).toString();
    }

    const propertyData = {
      propertyType,
      category,
      title,
      description,
      address,
      city,
      district,
      area: parseInt(area),
      rooms: parseInt(rooms),
      floor: floor ? parseInt(floor) : null,
      totalFloors: totalFloors ? parseInt(totalFloors) : null,
      yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
      exposure,
      heating,
      priceEur: priceEur ? priceEur.toString() : null,
      pricePerSqm: pricePerSqm || calculatedPricePerSqm,
      monthlyRentEur: monthlyRentEur ? monthlyRentEur.toString() : null,
      managementFeePercent: managementFeePercent ? managementFeePercent.toString() : null,
      rentalConditions,
      status,
      viewings: 0,
      sellerId: sellerId ? parseInt(sellerId) : 1, // Default to first seller
      assignedAgentId: assignedAgentId ? parseInt(assignedAgentId) : 1 // Default to first agent
    };

    const property = await prisma.property.create({
      data: propertyData,
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
        tenants: true
      }
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert numeric fields
    if (updateData.area) updateData.area = parseInt(updateData.area);
    if (updateData.rooms) updateData.rooms = parseInt(updateData.rooms);
    if (updateData.floor) updateData.floor = parseInt(updateData.floor);
    if (updateData.totalFloors) updateData.totalFloors = parseInt(updateData.totalFloors);
    if (updateData.yearBuilt) updateData.yearBuilt = parseInt(updateData.yearBuilt);
    if (updateData.sellerId) updateData.sellerId = parseInt(updateData.sellerId);
    if (updateData.assignedAgentId) updateData.assignedAgentId = parseInt(updateData.assignedAgentId);

    // Convert string fields
    if (updateData.priceEur) updateData.priceEur = updateData.priceEur.toString();
    if (updateData.monthlyRentEur) updateData.monthlyRentEur = updateData.monthlyRentEur.toString();
    if (updateData.managementFeePercent) updateData.managementFeePercent = updateData.managementFeePercent.toString();

    // Recalculate price per sqm if needed
    if ((updateData.priceEur || updateData.area) && updateData.propertyType === 'sale') {
      const currentProperty = await prisma.property.findUnique({
        where: { id: parseInt(id) }
      });
      
      const newPrice = updateData.priceEur || currentProperty.priceEur;
      const newArea = updateData.area || currentProperty.area;
      
      if (newPrice && newArea) {
        updateData.pricePerSqm = Math.round(parseFloat(newPrice) / parseFloat(newArea)).toString();
      }
    }

    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data: updateData,
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
        tenants: true
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

    // Check if property exists and has tenants
    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) },
      include: { tenants: true }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Delete associated tenants first (if any)
    if (property.tenants.length > 0) {
      await prisma.tenant.deleteMany({
        where: { propertyId: parseInt(id) }
      });
    }

    // Delete the property
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

// PATCH /api/properties/:id/viewings - Increment viewings count
router.patch('/:id/viewings', async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data: {
        viewings: { increment: 1 },
        lastViewing: new Date()
      },
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
        }
      }
    });

    res.json(property);
  } catch (error) {
    console.error('Error updating viewings:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.status(500).json({ error: 'Failed to update viewings' });
  }
});

module.exports = router;