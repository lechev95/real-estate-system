// backend/routes/search.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/search - Universal search endpoint
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const searchTerm = q.trim();
    const searchLimit = Math.min(parseInt(limit), 50); // Max 50 results

    const results = {
      properties: [],
      buyers: [],
      sellers: [],
      tasks: [],
      query: searchTerm,
      type
    };

    // Search properties
    if (type === 'all' || type === 'properties') {
      results.properties = await prisma.property.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { address: { contains: searchTerm, mode: 'insensitive' } },
            { city: { contains: searchTerm, mode: 'insensitive' } },
            { district: { contains: searchTerm, mode: 'insensitive' } },
            { id: isNaN(parseInt(searchTerm)) ? undefined : parseInt(searchTerm) }
          ].filter(Boolean)
        },
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
          }
        },
        take: searchLimit,
        orderBy: { createdAt: 'desc' }
      });
    }

    // Search buyers
    if (type === 'all' || type === 'buyers') {
      results.buyers = await prisma.buyer.findMany({
        where: {
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { id: isNaN(parseInt(searchTerm)) ? undefined : parseInt(searchTerm) }
          ].filter(Boolean)
        },
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
        orderBy: { createdAt: 'desc' }
      });
    }

    // Search sellers
    if (type === 'all' || type === 'sellers') {
      results.sellers = await prisma.seller.findMany({
        where: {
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { id: isNaN(parseInt(searchTerm)) ? undefined : parseInt(searchTerm) }
          ].filter(Boolean)
        },
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              propertyType: true,
              status: true
            },
            take: 3 // Limit to 3 properties per seller in search results
          }
        },
        take: searchLimit,
        orderBy: { createdAt: 'desc' }
      });
    }

    // Search tasks
    if (type === 'all' || type === 'tasks') {
      results.tasks = await prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { id: isNaN(parseInt(searchTerm)) ? undefined : parseInt(searchTerm) }
          ].filter(Boolean)
        },
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
        orderBy: { createdAt: 'desc' }
      });
    }

    // Calculate total results
    const totalResults = results.properties.length + 
                        results.buyers.length + 
                        results.sellers.length + 
                        results.tasks.length;

    res.json({
      ...results,
      totalResults,
      searchTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = q.trim();
    const suggestions = [];

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
          district: true
        },
        take: 5
      });

      propertySuggestions.forEach(property => {
        suggestions.push({
          type: 'property',
          id: property.id,
          text: property.title,
          subtext: `${property.address}, ${property.city}`,
          icon: '🏠'
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
            status: true
          },
          take: 3
        });

        buyerSuggestions.forEach(buyer => {
          suggestions.push({
            type: 'buyer',
            id: buyer.id,
            text: `${buyer.firstName} ${buyer.lastName}`,
            subtext: buyer.phone,
            icon: '👤'
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
            phone: true
          },
          take: 3
        });

        sellerSuggestions.forEach(seller => {
          suggestions.push({
            type: 'seller',
            id: seller.id,
            text: `${seller.firstName} ${seller.lastName}`,
            subtext: seller.phone,
            icon: '🏪'
          });
        });
      }
    }

    res.json({ 
      suggestions: suggestions.slice(0, 10), // Limit to 10 suggestions
      query: searchTerm 
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// GET /api/search/quick - Quick ID-based search
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

      default:
        return res.status(400).json({ error: 'Invalid type' });
    }

    if (!result) {
      return res.status(404).json({ error: `${type} not found` });
    }

    res.json({ result, type });

  } catch (error) {
    console.error('Error in quick search:', error);
    res.status(500).json({ error: 'Quick search failed' });
  }
});

module.exports = router;