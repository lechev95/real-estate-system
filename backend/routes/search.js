// backend/routes/search.js - COMPLETE SEARCH ROUTES
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to build search conditions
const buildSearchConditions = (query, fields) => {
  if (!query || query.length < 2) return {};
  
  return {
    OR: fields.map(field => ({
      [field]: { contains: query, mode: 'insensitive' }
    }))
  };
};

// Helper function to parse price range
const parsePriceRange = (minPrice, maxPrice) => {
  const conditions = {};
  
  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) conditions.gte = min.toString();
  }
  
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) conditions.lte = max.toString();
  }
  
  return Object.keys(conditions).length > 0 ? conditions : undefined;
};

// GET /api/search/properties - Advanced property search
router.get('/properties', async (req, res) => {
  try {
    const { 
      q, 
      propertyType, 
      category,
      city, 
      district,
      minPrice, 
      maxPrice,
      minRent,
      maxRent,
      rooms, 
      minArea,
      maxArea,
      yearBuilt,
      exposure,
      heating,
      status,
      sellerId,
      agentId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    
    // Text search across multiple fields
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { district: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    // Property type and category filters
    if (propertyType && propertyType !== 'all') {
      where.propertyType = propertyType;
    }
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    // Location filters
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    if (district) {
      where.district = { contains: district, mode: 'insensitive' };
    }
    
    // Price filters for sale properties
    if (propertyType === 'sale' || !propertyType) {
      const priceConditions = parsePriceRange(minPrice, maxPrice);
      if (priceConditions) {
        where.priceEur = priceConditions;
      }
    }
    
    // Rent filters for rental properties
    if (propertyType === 'rent' || propertyType === 'managed' || !propertyType) {
      const rentConditions = parsePriceRange(minRent, maxRent);
      if (rentConditions) {
        where.monthlyRentEur = rentConditions;
      }
    }
    
    // Area filters
    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = parseFloat(minArea);
      if (maxArea) where.area.lte = parseFloat(maxArea);
    }
    
    // Room filter
    if (rooms && !isNaN(parseInt(rooms))) {
      where.rooms = parseInt(rooms);
    }
    
    // Year built filter
    if (yearBuilt && !isNaN(parseInt(yearBuilt))) {
      where.yearBuilt = parseInt(yearBuilt);
    }
    
    // Other filters
    if (exposure) where.exposure = exposure;
    if (heating) where.heating = heating;
    if (status && status !== 'all') where.status = status;
    if (sellerId) where.sellerId = parseInt(sellerId);
    if (agentId) where.assignedAgentId = parseInt(agentId);
    
    // Build order by clause
    const orderBy = {};
    const validSortFields = ['createdAt', 'priceEur', 'monthlyRentEur', 'area', 'rooms', 'viewings', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    orderBy[sortField] = order;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: parseInt(limit),
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
              phone: true
            }
          }
        },
        orderBy
      }),
      prisma.property.count({ where })
    ]);

    res.json({
      query: q,
      filters: { 
        propertyType, category, city, district, 
        minPrice, maxPrice, minRent, maxRent,
        rooms, minArea, maxArea, yearBuilt, 
        exposure, heating, status, sellerId, agentId 
      },
      results: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      sorting: {
        sortBy: sortField,
        sortOrder: order
      }
    });

  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ 
      error: 'Failed to search properties',
      details: error.message 
    });
  }
});

// GET /api/search/buyers - Advanced buyer search
router.get('/buyers', async (req, res) => {
  try {
    const { 
      q, 
      status, 
      propertyType,
      minBudget,
      maxBudget,
      preferredRooms,
      preferredAreas,
      agentId,
      page = 1,
      limit = 20 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    
    // Text search across buyer fields
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }
    
    // Property type preference
    if (propertyType && propertyType !== 'all') {
      where.preferredPropertyType = propertyType;
    }
    
    // Budget filters
    if (minBudget || maxBudget) {
      if (minBudget) {
        where.budgetMax = { gte: parseFloat(minBudget).toString() };
      }
      if (maxBudget) {
        where.budgetMin = { lte: parseFloat(maxBudget).toString() };
      }
    }
    
    // Room preference
    if (preferredRooms && !isNaN(parseInt(preferredRooms))) {
      where.preferredRooms = parseInt(preferredRooms);
    }
    
    // Area preference
    if (preferredAreas) {
      where.preferredAreas = {
        hasSome: preferredAreas.split(',').map(area => area.trim())
      };
    }
    
    // Agent filter
    if (agentId) {
      where.assignedAgentId = parseInt(agentId);
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
              propertyType: true,
              viewedAt: true
            },
            take: 3,
            orderBy: { viewedAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.buyer.count({ where })
    ]);

    res.json({
      query: q,
      filters: { 
        status, propertyType, minBudget, maxBudget, 
        preferredRooms, preferredAreas, agentId 
      },
      results: buyers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error searching buyers:', error);
    res.status(500).json({ 
      error: 'Failed to search buyers',
      details: error.message 
    });
  }
});

// GET /api/search/sellers - Seller search
router.get('/sellers', async (req, res) => {
  try {
    const { q, status, city, agentId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    
    // Text search
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } }
      ];
    }
    
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
              monthlyRentEur: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.seller.count({ where })
    ]);

    res.json({
      query: q,
      filters: { status, city, agentId },
      results: sellers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error searching sellers:', error);
    res.status(500).json({ 
      error: 'Failed to search sellers',
      details: error.message 
    });
  }
});

// GET /api/search/tasks - Task search
router.get('/tasks', async (req, res) => {
  try {
    const { 
      q, 
      status, 
      priority, 
      type,
      agentId, 
      propertyId,
      dueDate,
      overdue,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    
    // Text search
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (type && type !== 'all') where.type = type;
    if (agentId) where.assignedAgentId = parseInt(agentId);
    if (propertyId) where.propertyId = parseInt(propertyId);
    
    // Date filters
    if (dueDate) {
      const date = new Date(dueDate);
      where.dueDate = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }
    
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'completed' };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
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
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              propertyType: true
            }
          },
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { priority: 'desc' },
          { dueDate: 'asc' }
        ]
      }),
      prisma.task.count({ where })
    ]);

    res.json({
      query: q,
      filters: { status, priority, type, agentId, propertyId, dueDate, overdue },
      results: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error searching tasks:', error);
    res.status(500).json({ 
      error: 'Failed to search tasks',
      details: error.message 
    });
  }
});

// GET /api/search/global - Global search across all entities
router.get('/global', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchLimit = Math.min(parseInt(limit), 10);

    const [properties, buyers, sellers, tasks] = await Promise.all([
      // Search properties
      prisma.property.findMany({
        where: buildSearchConditions(q, ['title', 'address', 'city', 'district', 'description']),
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          propertyType: true,
          status: true,
          priceEur: true,
          monthlyRentEur: true,
          seller: {
            select: { firstName: true, lastName: true }
          }
        },
        take: searchLimit,
        orderBy: { createdAt: 'desc' }
      }),
      
      // Search buyers
      prisma.buyer.findMany({
        where: buildSearchConditions(q, ['firstName', 'lastName', 'phone', 'email', 'notes']),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          status: true,
          preferredPropertyType: true
        },
        take: searchLimit,
        orderBy: { createdAt: 'desc' }
      }),
      
      // Search sellers
      prisma.seller.findMany({
        where: buildSearchConditions(q, ['firstName', 'lastName', 'phone', 'email', 'address', 'notes']),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          status: true,
          city: true
        },
        take: searchLimit,
        orderBy: { createdAt: 'desc' }
      }).catch(() => []), // Catch error if sellers table doesn't exist
      
      // Search tasks
      prisma.task.findMany({
        where: buildSearchConditions(q, ['title', 'description', 'notes', 'location']),
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          property: {
            select: { title: true }
          },
          assignedAgent: {
            select: { firstName: true, lastName: true }
          }
        },
        take: searchLimit,
        orderBy: { dueDate: 'asc' }
      }).catch(() => [])
    ]);

    // Add type identifier to each result
    const results = {
      properties: properties.map(p => ({ ...p, type: 'property' })),
      buyers: buyers.map(b => ({ ...b, type: 'buyer' })),
      sellers: sellers.map(s => ({ ...s, type: 'seller' })),
      tasks: tasks.map(t => ({ ...t, type: 'task' }))
    };

    // Create unified results array for quick access
    const allResults = [
      ...results.properties,
      ...results.buyers,
      ...results.sellers,
      ...results.tasks
    ];

    res.json({
      query: q,
      results,
      unified: allResults,
      summary: {
        total: allResults.length,
        properties: properties.length,
        buyers: buyers.length,
        sellers: sellers.length,
        tasks: tasks.length
      }
    });

  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({ 
      error: 'Failed to perform global search',
      details: error.message 
    });
  }
});

// GET /api/search/autocomplete - Search autocomplete suggestions
router.get('/autocomplete', async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;
    
    if (!q || q.length < 1) {
      return res.json({ suggestions: [] });
    }

    const suggestions = [];
    const searchLimit = Math.min(parseInt(limit), 20);

    if (type === 'all' || type === 'properties') {
      const propertyTitles = await prisma.property.findMany({
        where: {
          title: { contains: q, mode: 'insensitive' }
        },
        select: { title: true },
        distinct: ['title'],
        take: searchLimit
      });
      
      suggestions.push(...propertyTitles.map(p => ({
        text: p.title,
        type: 'property',
        category: 'Properties'
      })));
    }

    if (type === 'all' || type === 'locations') {
      const cities = await prisma.property.findMany({
        where: {
          city: { contains: q, mode: 'insensitive' }
        },
        select: { city: true },
        distinct: ['city'],
        take: searchLimit
      });
      
      suggestions.push(...cities.map(c => ({
        text: c.city,
        type: 'location',
        category: 'Cities'
      })));
    }

    if (type === 'all' || type === 'people') {
      const buyers = await prisma.buyer.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } }
          ]
        },
        select: { firstName: true, lastName: true },
        take: searchLimit
      });
      
      suggestions.push(...buyers.map(b => ({
        text: `${b.firstName} ${b.lastName}`,
        type: 'buyer',
        category: 'Buyers'
      })));
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text && s.type === suggestion.type)
      )
      .slice(0, parseInt(limit));

    res.json({
      query: q,
      suggestions: uniqueSuggestions
    });

  } catch (error) {
    console.error('Error in autocomplete search:', error);
    res.status(500).json({ 
      error: 'Failed to get autocomplete suggestions',
      details: error.message 
    });
  }
});

// GET /api/search/filters - Get available filter options
router.get('/filters', async (req, res) => {
  try {
    const { type = 'properties' } = req.query;

    let filterOptions = {};

    if (type === 'properties') {
      const [
        propertyTypes,
        categories,
        cities,
        districts,
        exposures,
        heatings,
        statuses
      ] = await Promise.all([
        prisma.property.groupBy({ by: ['propertyType'], _count: { id: true } }),
        prisma.property.groupBy({ by: ['category'], _count: { id: true } }),
        prisma.property.groupBy({ by: ['city'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
        prisma.property.groupBy({ by: ['district'], _count: { id: true }, where: { district: { not: null } } }),
        prisma.property.groupBy({ by: ['exposure'], _count: { id: true }, where: { exposure: { not: null } } }),
        prisma.property.groupBy({ by: ['heating'], _count: { id: true }, where: { heating: { not: null } } }),
        prisma.property.groupBy({ by: ['status'], _count: { id: true } })
      ]);

      filterOptions = {
        propertyTypes: propertyTypes.map(pt => ({ value: pt.propertyType, count: pt._count.id })),
        categories: categories.map(c => ({ value: c.category, count: c._count.id })),
        cities: cities.map(c => ({ value: c.city, count: c._count.id })),
        districts: districts.map(d => ({ value: d.district, count: d._count.id })),
        exposures: exposures.map(e => ({ value: e.exposure, count: e._count.id })),
        heatings: heatings.map(h => ({ value: h.heating, count: h._count.id })),
        statuses: statuses.map(s => ({ value: s.status, count: s._count.id }))
      };
    }

    res.json({
      type,
      filters: filterOptions
    });

  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ 
      error: 'Failed to get filter options',
      details: error.message 
    });
  }
});

module.exports = router;