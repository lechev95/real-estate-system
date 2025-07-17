// backend/routes/search.js - OPTIMIZED VERSION
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Cache for search suggestions (in-memory cache for performance)
let suggestionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to clear expired cache entries
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of suggestionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      suggestionCache.delete(key);
    }
  }
};

// GET /api/search - Universal search endpoint with optimization
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all', limit = 10, page = 1 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const searchTerm = q.trim();
    const searchLimit = Math.min(parseInt(limit), 50); // Max 50 results
    const searchPage = Math.max(1, parseInt(page));

    const results = {
      properties: [],
      buyers: [],
      sellers: [],
      tasks: [],
      query: searchTerm,
      type,
      page: searchPage,
      limit: searchLimit
    };

    const searchPromises = [];

    // Search properties with enhanced queries
    if (type === 'all' || type === 'properties') {
      const propertyWhere = {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm, mode: 'insensitive' } },
          { city: { contains: searchTerm, mode: 'insensitive' } },
          { district: { contains: searchTerm, mode: 'insensitive' } },
          { heating: { contains: searchTerm, mode: 'insensitive' } },
          { exposure: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };

      // Add ID search if term is numeric
      if (!isNaN(parseInt(searchTerm))) {
        propertyWhere.OR.push({ id: parseInt(searchTerm) });
      }

      // Add price range search if term contains numbers
      const priceMatch = searchTerm.match(/(\d+)/);
      if (priceMatch) {
        const priceValue = parseInt(priceMatch[1]);
        propertyWhere.OR.push(
          { priceEur: { gte: (priceValue * 0.8).toString(), lte: (priceValue * 1.2).toString() } },
          { monthlyRentEur: { gte: (priceValue * 0.8).toString(), lte: (priceValue * 1.2).toString() } }
        );
      }

      searchPromises.push(
        prisma.property.findMany({
          where: propertyWhere,
          include: {
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true
              }
            },
            assignedAgent: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            tenants: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              },
              take: 1
            }
          },
          take: searchLimit,
          skip: (searchPage - 1) * searchLimit,
          orderBy: [
            { viewings: 'desc' }, // Most viewed first
            { createdAt: 'desc' }
          ]
        }).then(data => { results.properties = data; })
      );
    }

    // Search buyers with enhanced queries
    if (type === 'all' || type === 'buyers') {
      const buyerWhere = {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { notes: { contains: searchTerm, mode: 'insensitive' } },
          { preferredAreas: { has: searchTerm } }
        ]
      };

      if (!isNaN(parseInt(searchTerm))) {
        buyerWhere.OR.push({ id: parseInt(searchTerm) });
        
        // Budget range search
        const budgetValue = parseInt(searchTerm);
        buyerWhere.OR.push(
          { budgetMin: { lte: budgetValue.toString() } },
          { budgetMax: { gte: budgetValue.toString() } }
        );
      }

      searchPromises.push(
        prisma.buyer.findMany({
          where: buyerWhere,
          include: {
            assignedAgent: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          take: searchLimit,
          skip: (searchPage - 1) * searchLimit,
          orderBy: [
            { status: 'asc' }, // Active buyers first
            { lastContact: 'desc' },
            { createdAt: 'desc' }
          ]
        }).then(data => { results.buyers = data; })
      );
    }

    // Search sellers with enhanced queries
    if (type === 'all' || type === 'sellers') {
      const sellerWhere = {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm, mode: 'insensitive' } },
          { notes: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };

      if (!isNaN(parseInt(searchTerm))) {
        sellerWhere.OR.push({ id: parseInt(searchTerm) });
      }

      searchPromises.push(
        prisma.seller.findMany({
          where: sellerWhere,
          include: {
            properties: {
              select: {
                id: true,
                title: true,
                propertyType: true,
                status: true
              },
              take: 3 // Limit to 3 properties per seller in search results
            },
            _count: {
              select: { properties: true }
            }
          },
          take: searchLimit,
          skip: (searchPage - 1) * searchLimit,
          orderBy: { createdAt: 'desc' }
        }).then(data => { results.sellers = data; })
      );
    }

    // Search tasks with enhanced queries
    if (type === 'all' || type === 'tasks') {
      const taskWhere = {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { type: { contains: searchTerm, mode: 'insensitive' } },
          { priority: { contains: searchTerm, mode: 'insensitive' } },
          { status: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };

      if (!isNaN(parseInt(searchTerm))) {
        taskWhere.OR.push({ id: parseInt(searchTerm) });
      }

      searchPromises.push(
        prisma.task.findMany({
          where: taskWhere,
          include: {
            assignedAgent: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            property: {
              select: {
                id: true,
                title: true,
                address: true
              }
            },
            buyer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          take: searchLimit,
          skip: (searchPage - 1) * searchLimit,
          orderBy: [
            { status: 'asc' }, // Pending tasks first
            { dueDate: 'asc' },
            { createdAt: 'desc' }
          ]
        }).then(data => { results.tasks = data; })
      );
    }

    // Execute all searches in parallel
    await Promise.all(searchPromises);

    // Calculate total results and relevance scoring
    const totalResults = results.properties.length + 
                        results.buyers.length + 
                        results.sellers.length + 
                        results.tasks.length;

    // Add relevance scoring
    const addRelevanceScore = (items, searchTerm) => {
      return items.map(item => {
        let score = 0;
        const term = searchTerm.toLowerCase();
        
        // Check various fields for exact matches (higher score)
        if (item.title && item.title.toLowerCase().includes(term)) score += 10;
        if (item.firstName && item.firstName.toLowerCase().includes(term)) score += 8;
        if (item.lastName && item.lastName.toLowerCase().includes(term)) score += 8;
        if (item.phone && item.phone.includes(term)) score += 6;
        if (item.address && item.address.toLowerCase().includes(term)) score += 5;
        if (item.email && item.email.toLowerCase().includes(term)) score += 4;
        
        return { ...item, relevanceScore: score };
      }).sort((a, b) => b.relevanceScore - a.relevanceScore);
    };

    // Apply relevance scoring to all results
    results.properties = addRelevanceScore(results.properties, searchTerm);
    results.buyers = addRelevanceScore(results.buyers, searchTerm);
    results.sellers = addRelevanceScore(results.sellers, searchTerm);
    results.tasks = addRelevanceScore(results.tasks, searchTerm);

    res.json({
      ...results,
      totalResults,
      searchTime: new Date().toISOString(),
      performance: {
        cacheHit: false,
        executionTime: Date.now() // This would be calculated in real implementation
      }
    });

  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ 
      error: 'Search failed',
      details: error.message 
    });
  }
});

// GET /api/search/suggestions - Get search suggestions with caching
router.get('/suggestions', async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = q.trim().toLowerCase();
    const cacheKey = `${searchTerm}-${type}-${limit}`;
    
    // Clear expired cache entries
    clearExpiredCache();
    
    // Check cache first
    if (suggestionCache.has(cacheKey)) {
      const cached = suggestionCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json({ 
          suggestions: cached.data,
          query: searchTerm,
          cached: true
        });
      }
    }

    const suggestions = [];
    const maxSuggestions = Math.min(parseInt(limit), 10);

    // Property suggestions
    if (type === 'all' || type === 'properties') {
      const propertySuggestions = await prisma.property.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { address: { contains: searchTerm, mode: 'insensitive' } },
            { city: { contains: searchTerm, mode: 'insensitive' } },
            { district: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          district: true,
          propertyType: true,
          priceEur: true,
          monthlyRentEur: true
        },
        take: Math.ceil(maxSuggestions / 3),
        orderBy: { viewings: 'desc' }
      });

      propertySuggestions.forEach(property => {
        const price = property.propertyType === 'sale' ? 
          `${parseInt(property.priceEur || 0).toLocaleString()} EUR` :
          `${parseInt(property.monthlyRentEur || 0).toLocaleString()} EUR/месец`;
          
        suggestions.push({
          type: 'property',
          id: property.id,
          text: property.title,
          subtext: `${property.address}, ${property.city} - ${price}`,
          icon: '🏠',
          category: property.propertyType,
          relevance: property.title.toLowerCase().indexOf(searchTerm) === 0 ? 10 : 5
        });
      });
    }

    // People suggestions (buyers and sellers)
    if (type === 'all' || type === 'buyers' || type === 'sellers') {
      // Buyers
      if (type === 'all' || type === 'buyers') {
        const buyerSuggestions = await prisma.buyer.findMany({
          where: {
            OR: [
              { firstName: { contains: searchTerm, mode: 'insensitive' } },
              { lastName: { contains: searchTerm, mode: 'insensitive' } },
              { phone: { contains: searchTerm } }
            ]
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            budgetMax: true
          },
          take: Math.ceil(maxSuggestions / 4),
          orderBy: { lastContact: 'desc' }
        });

        buyerSuggestions.forEach(buyer => {
          const budget = buyer.budgetMax ? ` (до ${parseInt(buyer.budgetMax).toLocaleString()} EUR)` : '';
          suggestions.push({
            type: 'buyer',
            id: buyer.id,
            text: `${buyer.firstName} ${buyer.lastName}`,
            subtext: `${buyer.phone} - ${buyer.status}${budget}`,
            icon: '👤',
            category: buyer.status,
            relevance: `${buyer.firstName} ${buyer.lastName}`.toLowerCase().indexOf(searchTerm) === 0 ? 10 : 5
          });
        });
      }

      // Sellers
      if (type === 'all' || type === 'sellers') {
        const sellerSuggestions = await prisma.seller.findMany({
          where: {
            OR: [
              { firstName: { contains: searchTerm, mode: 'insensitive' } },
              { lastName: { contains: searchTerm, mode: 'insensitive' } },
              { phone: { contains: searchTerm } }
            ]
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            _count: {
              select: { properties: true }
            }
          },
          take: Math.ceil(maxSuggestions / 4),
          orderBy: { createdAt: 'desc' }
        });

        sellerSuggestions.forEach(seller => {
          const propCount = seller._count.properties;
          const propText = propCount === 1 ? '1 имот' : `${propCount} имота`;
          suggestions.push({
            type: 'seller',
            id: seller.id,
            text: `${seller.firstName} ${seller.lastName}`,
            subtext: `${seller.phone} - ${propText}`,
            icon: '🏪',
            category: propCount > 0 ? 'active' : 'inactive',
            relevance: `${seller.firstName} ${seller.lastName}`.toLowerCase().indexOf(searchTerm) === 0 ? 10 : 5
          });
        });
      }
    }

    // Task suggestions
    if (type === 'all' || type === 'tasks') {
      const taskSuggestions = await prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          type: true,
          priority: true,
          status: true,
          dueDate: true
        },
        take: Math.ceil(maxSuggestions / 4),
        orderBy: { dueDate: 'asc' }
      });

      taskSuggestions.forEach(task => {
        const dueText = new Date(task.dueDate).toLocaleDateString('bg-BG');
        suggestions.push({
          type: 'task',
          id: task.id,
          text: task.title,
          subtext: `${task.type} - ${task.priority} - ${dueText}`,
          icon: '📅',
          category: task.status,
          relevance: task.title.toLowerCase().indexOf(searchTerm) === 0 ? 10 : 5
        });
      });
    }

    // Sort by relevance and limit results
    const finalSuggestions = suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxSuggestions);

    // Cache the results
    suggestionCache.set(cacheKey, {
      data: finalSuggestions,
      timestamp: Date.now()
    });

    res.json({ 
      suggestions: finalSuggestions,
      query: searchTerm,
      cached: false,
      cacheSize: suggestionCache.size
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to get suggestions',
      details: error.message 
    });
  }
});

// GET /api/search/quick - Quick ID-based search with validation
router.get('/quick', async (req, res) => {
  try {
    const { id, type } = req.query;

    if (!id || !type) {
      return res.status(400).json({ error: 'ID and type are required' });
    }

    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const validTypes = ['property', 'buyer', 'seller', 'task'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    let result = null;

    switch (type) {
      case 'property':
        result = await prisma.property.findUnique({
          where: { id: numericId },
          include: {
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true
              }
            },
            assignedAgent: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            tenants: true
          }
        });
        break;

      case 'buyer':
        result = await prisma.buyer.findUnique({
          where: { id: numericId },
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
        break;

      case 'seller':
        result = await prisma.seller.findUnique({
          where: { id: numericId },
          include: {
            properties: {
              select: {
                id: true,
                title: true,
                propertyType: true,
                status: true
              }
            },
            _count: {
              select: { properties: true }
            }
          }
        });
        break;

      case 'task':
        result = await prisma.task.findUnique({
          where: { id: numericId },
          include: {
            assignedAgent: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            property: {
              select: {
                id: true,
                title: true,
                address: true
              }
            },
            buyer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });
        break;
    }

    if (!result) {
      return res.status(404).json({ error: `${type} not found` });
    }

    res.json({ result, type });

  } catch (error) {
    console.error('Error in quick search:', error);
    res.status(500).json({ 
      error: 'Quick search failed',
      details: error.message 
    });
  }
});

// GET /api/search/advanced - Advanced search with multiple filters
router.get('/advanced', async (req, res) => {
  try {
    const {
      q,
      propertyType,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      rooms,
      city,
      district,
      buyerStatus,
      taskStatus,
      dateFrom,
      dateTo,
      limit = 20,
      page = 1
    } = req.query;

    const searchLimit = Math.min(parseInt(limit), 100);
    const searchPage = Math.max(1, parseInt(page));
    const skip = (searchPage - 1) * searchLimit;

    let results = { properties: [], buyers: [], sellers: [], tasks: [] };

    // Advanced property search
    const propertyWhere = {};
    
    if (q && q.trim()) {
      propertyWhere.OR = [
        { title: { contains: q.trim(), mode: 'insensitive' } },
        { description: { contains: q.trim(), mode: 'insensitive' } },
        { address: { contains: q.trim(), mode: 'insensitive' } }
      ];
    }
    
    if (propertyType && propertyType !== 'all') {
      propertyWhere.propertyType = propertyType;
    }
    
    if (city) {
      propertyWhere.city = { contains: city, mode: 'insensitive' };
    }
    
    if (district) {
      propertyWhere.district = { contains: district, mode: 'insensitive' };
    }
    
    if (rooms && !isNaN(parseInt(rooms))) {
      propertyWhere.rooms = parseInt(rooms);
    }
    
    if (areaMin || areaMax) {
      propertyWhere.area = {};
      if (areaMin && !isNaN(parseInt(areaMin))) {
        propertyWhere.area.gte = parseInt(areaMin);
      }
      if (areaMax && !isNaN(parseInt(areaMax))) {
        propertyWhere.area.lte = parseInt(areaMax);
      }
    }
    
    if (priceMin || priceMax) {
      propertyWhere.OR = propertyWhere.OR || [];
      const priceConditions = [];
      
      if (priceMin || priceMax) {
        // For sale properties
        const saleCondition = { propertyType: 'sale' };
        if (priceMin) saleCondition.priceEur = { ...saleCondition.priceEur, gte: priceMin };
        if (priceMax) saleCondition.priceEur = { ...saleCondition.priceEur, lte: priceMax };
        priceConditions.push(saleCondition);
        
        // For rent properties
        const rentCondition = { propertyType: { in: ['rent', 'managed'] } };
        if (priceMin) rentCondition.monthlyRentEur = { ...rentCondition.monthlyRentEur, gte: priceMin };
        if (priceMax) rentCondition.monthlyRentEur = { ...rentCondition.monthlyRentEur, lte: priceMax };
        priceConditions.push(rentCondition);
      }
      
      if (propertyWhere.OR.length === 0) {
        propertyWhere.OR = priceConditions;
      } else {
        propertyWhere.AND = [
          { OR: propertyWhere.OR },
          { OR: priceConditions }
        ];
        delete propertyWhere.OR;
      }
    }

    results.properties = await prisma.property.findMany({
      where: propertyWhere,
      include: {
        seller: { select: { firstName: true, lastName: true, phone: true } },
        assignedAgent: { select: { firstName: true, lastName: true } }
      },
      take: searchLimit,
      skip,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      ...results,
      filters: {
        q, propertyType, priceMin, priceMax, areaMin, areaMax,
        rooms, city, district, buyerStatus, taskStatus, dateFrom, dateTo
      },
      pagination: {
        page: searchPage,
        limit: searchLimit,
        total: results.properties.length
      },
      searchTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ 
      error: 'Advanced search failed',
      details: error.message 
    });
  }
});

// DELETE /api/search/cache - Clear search cache (admin endpoint)
router.delete('/cache', async (req, res) => {
  try {
    const cacheSize = suggestionCache.size;
    suggestionCache.clear();
    
    res.json({ 
      message: 'Search cache cleared successfully',
      clearedEntries: cacheSize
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      details: error.message 
    });
  }
});

module.exports = router;