// backend/routes/properties.js - FIXED VERSION
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
    res.status(500).json({ 
      error: 'Failed to fetch properties',
      details: error.message 
    });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    
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
    res.status(500).json({ 
      error: 'Failed to fetch property',
      details: error.message 
    });
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

    console.log('Creating property with data:', req.body);

    // Enhanced validation
    const errors = [];
    
    if (!title || title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (!propertyType || !['sale', 'rent', 'managed'].includes(propertyType)) {
      errors.push('Valid property type is required (sale, rent, managed)');
    }
    
    if (!category || !['apartment', 'house', 'office', 'commercial'].includes(category)) {
      errors.push('Valid category is required (apartment, house, office, commercial)');
    }
    
    if (!address || address.trim().length === 0) {
      errors.push('Address is required');
    }
    
    if (!city || city.trim().length === 0) {
      errors.push('City is required');
    }
    
    if (!area || isNaN(parseInt(area)) || parseInt(area) <= 0) {
      errors.push('Valid area is required');
    }
    
    if (!rooms || isNaN(parseInt(rooms)) || parseInt(rooms) <= 0) {
      errors.push('Valid number of rooms is required');
    }

    // Type-specific validation
    if (propertyType === 'sale') {
      if (!priceEur || isNaN(parseFloat(priceEur)) || parseFloat(priceEur) <= 0) {
        errors.push('Valid price is required for sale properties');
      }
    }

    if (propertyType === 'rent' || propertyType === 'managed') {
      if (!monthlyRentEur || isNaN(parseFloat(monthlyRentEur)) || parseFloat(monthlyRentEur) <= 0) {
        errors.push('Valid monthly rent is required for rental properties');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors 
      });
    }

    // Calculate price per sqm for sale properties
    let calculatedPricePerSqm = null;
    if (propertyType === 'sale' && priceEur && area) {
      calculatedPricePerSqm = Math.round(parseFloat(priceEur) / parseFloat(area)).toString();
    }

    // Prepare data for database
    const propertyData = {
      propertyType,
      category,
      title: title.trim(),
      description: description ? description.trim() : null,
      address: address.trim(),
      city: city.trim(),
      district: district ? district.trim() : null,
      area: parseInt(area),
      rooms: parseInt(rooms),
      floor: floor ? parseInt(floor) : null,
      totalFloors: totalFloors ? parseInt(totalFloors) : null,
      yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
      exposure: exposure || null,
      heating: heating || null,
      priceEur: priceEur ? parseFloat(priceEur).toString() : null,
      pricePerSqm: pricePerSqm || calculatedPricePerSqm,
      monthlyRentEur: monthlyRentEur ? parseFloat(monthlyRentEur).toString() : null,
      managementFeePercent: managementFeePercent ? parseFloat(managementFeePercent).toString() : null,
      rentalConditions: rentalConditions || null,
      status: status || 'available',
      viewings: 0,
      lastViewing: null,
      sellerId: sellerId ? parseInt(sellerId) : 1, // Default to first seller
      assignedAgentId: assignedAgentId ? parseInt(assignedAgentId) : 1 // Default to first agent
    };

    console.log('Processed property data:', propertyData);

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

    console.log('Created property:', property.id);
    res.status(201).json(property);
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
    const updateData = { ...req.body };

    console.log('Updating property', id, 'with data:', updateData);

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Validate and clean data
    const cleanData = {};
    
    if (updateData.title !== undefined) {
      if (!updateData.title || updateData.title.trim().length === 0) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      cleanData.title = updateData.title.trim();
    }

    if (updateData.propertyType !== undefined) {
      if (!['sale', 'rent', 'managed'].includes(updateData.propertyType)) {
        return res.status(400).json({ error: 'Invalid property type' });
      }
      cleanData.propertyType = updateData.propertyType;
    }

    if (updateData.category !== undefined) {
      if (!['apartment', 'house', 'office', 'commercial'].includes(updateData.category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      cleanData.category = updateData.category;
    }

    if (updateData.address !== undefined) {
      if (!updateData.address || updateData.address.trim().length === 0) {
        return res.status(400).json({ error: 'Address cannot be empty' });
      }
      cleanData.address = updateData.address.trim();
    }

    if (updateData.city !== undefined) {
      if (!updateData.city || updateData.city.trim().length === 0) {
        return res.status(400).json({ error: 'City cannot be empty' });
      }
      cleanData.city = updateData.city.trim();
    }

    if (updateData.district !== undefined) {
      cleanData.district = updateData.district ? updateData.district.trim() : null;
    }

    if (updateData.area !== undefined) {
      const area = parseInt(updateData.area);
      if (isNaN(area) || area <= 0) {
        return res.status(400).json({ error: 'Valid area is required' });
      }
      cleanData.area = area;
    }

    if (updateData.rooms !== undefined) {
      const rooms = parseInt(updateData.rooms);
      if (isNaN(rooms) || rooms <= 0) {
        return res.status(400).json({ error: 'Valid number of rooms is required' });
      }
      cleanData.rooms = rooms;
    }

    if (updateData.floor !== undefined) {
      cleanData.floor = updateData.floor ? parseInt(updateData.floor) : null;
    }

    if (updateData.totalFloors !== undefined) {
      cleanData.totalFloors = updateData.totalFloors ? parseInt(updateData.totalFloors) : null;
    }

    if (updateData.yearBuilt !== undefined) {
      cleanData.yearBuilt = updateData.yearBuilt ? parseInt(updateData.yearBuilt) : null;
    }

    if (updateData.exposure !== undefined) {
      cleanData.exposure = updateData.exposure || null;
    }

    if (updateData.heating !== undefined) {
      cleanData.heating = updateData.heating || null;
    }

    if (updateData.priceEur !== undefined) {
      if (updateData.priceEur && (isNaN(parseFloat(updateData.priceEur)) || parseFloat(updateData.priceEur) <= 0)) {
        return res.status(400).json({ error: 'Invalid price' });
      }
      cleanData.priceEur = updateData.priceEur ? parseFloat(updateData.priceEur).toString() : null;
    }

    if (updateData.monthlyRentEur !== undefined) {
      if (updateData.monthlyRentEur && (isNaN(parseFloat(updateData.monthlyRentEur)) || parseFloat(updateData.monthlyRentEur) <= 0)) {
        return res.status(400).json({ error: 'Invalid monthly rent' });
      }
      cleanData.monthlyRentEur = updateData.monthlyRentEur ? parseFloat(updateData.monthlyRentEur).toString() : null;
    }

    if (updateData.managementFeePercent !== undefined) {
      cleanData.managementFeePercent = updateData.managementFeePercent ? parseFloat(updateData.managementFeePercent).toString() : null;
    }

    if (updateData.rentalConditions !== undefined) {
      cleanData.rentalConditions = updateData.rentalConditions || null;
    }

    if (updateData.description !== undefined) {
      cleanData.description = updateData.description ? updateData.description.trim() : null;
    }

    if (updateData.status !== undefined) {
      if (!['available', 'rented', 'managed', 'sold'].includes(updateData.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      cleanData.status = updateData.status;
    }

    if (updateData.sellerId !== undefined) {
      cleanData.sellerId = updateData.sellerId ? parseInt(updateData.sellerId) : null;
    }

    if (updateData.assignedAgentId !== undefined) {
      cleanData.assignedAgentId = updateData.assignedAgentId ? parseInt(updateData.assignedAgentId) : null;
    }

    // Recalculate price per sqm if needed
    if (cleanData.priceEur !== undefined || cleanData.area !== undefined) {
      const finalPrice = cleanData.priceEur || existingProperty.priceEur;
      const finalArea = cleanData.area || existingProperty.area;
      
      if (finalPrice && finalArea && (cleanData.propertyType === 'sale' || existingProperty.propertyType === 'sale')) {
        cleanData.pricePerSqm = Math.round(parseFloat(finalPrice) / parseFloat(finalArea)).toString();
      }
    }

    console.log('Clean data for update:', cleanData);

    const property = await prisma.property.update({
      where: { id: parseInt(id) },
      data: cleanData,
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

    console.log('Updated property:', property.id);
    res.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ 
      error: 'Failed to update property',
      details: error.message 
    });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

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

    console.log('Deleted property:', id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.status(500).json({ 
      error: 'Failed to delete property',
      details: error.message 
    });
  }
});

// PATCH /api/properties/:id/viewings - Increment viewings count
router.patch('/:id/viewings', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

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
    res.status(500).json({ 
      error: 'Failed to update viewings',
      details: error.message 
    });
  }
});

module.exports = router;