const express = require('express');
const { query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/search - Universal search across all entities
router.get('/', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('type').optional().isIn(['all', 'properties', 'buyers', 'sellers', 'tasks']).withMessage('Invalid search type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q, type = 'all', limit = 10 } = req.query;
    const searchQuery = q.trim();
    const searchLimit = Math.min(parseInt(limit), 50); // Max 50 results

    let results = {
      properties: [],
      buyers: [],
      sellers: [],
      tasks: []
    };

    // Check if query looks like a phone number
    const isPhoneNumber = /^[\+]?[0-9\s\-\(\)]{7,}$/.test(searchQuery);
    
    // Check if query looks like an ID
    const isId = /^\d+$/.test(searchQuery);

    // Search Properties
    if (type === 'all' || type === 'properties') {
      const propertySearchConditions = {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { address: { contains: searchQuery, mode: 'insensitive' } },
          { district: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } }
        ]
      };

      // Add ID search if query is numeric
      if (isId) {
        propertySearchConditions.OR.push({ id: parseInt(searchQuery) });
      }

      results.properties = await prisma.property.findMany({
        where: propertySearchConditions,
        take: searchLimit,
        select: {
          id: true,
          title: true,
          address: true,
          district: true,
          propertyType: true,
          category: true,
          area: true,
          rooms: true,
          status: true,
          priceEur: true,
          monthlyRentEur: true,
          viewings: true,
          seller: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          assignedAgent: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: [
          { viewings: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    }

    // Search Buyers
    if (type === 'all' || type === 'buyers') {
      const buyerSearchConditions = {
        OR: [
          { firstName: { contains: searchQuery, mode: 'insensitive' } },
          { lastName: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { preferredLocation: { contains: searchQuery, mode: 'insensitive' } }
        ]
      };

      // Add phone and ID search
      if (isPhoneNumber) {
        buyerSearchConditions.OR.push({ phone: { contains: searchQuery.replace(/\s/g, '') } });
      }
      if (isId) {
        buyerSearchConditions.OR.push({ id: parseInt(searchQuery) });
      }

      results.buyers = await prisma.buyer.findMany({
        where: buyerSearchConditions,
        take: searchLimit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          status: true,
          budgetMin: true,
          budgetMax: true,
          preferredLocation: true,
          propertyType: true,
          assignedAgent: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Search Sellers
    if (type === 'all' || type === 'sellers') {
      const sellerSearchConditions = {
        OR: [
          { firstName: { contains: searchQuery, mode: 'insensitive' } },
          { lastName: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } }
        ]
      };

      // Add phone and ID search
      if (isPhoneNumber) {
        sellerSearchConditions.OR.push({ phone: { contains: searchQuery.replace(/\s/g, '') } });
      }
      if (isId) {
        sellerSearchConditions.OR.push({ id: parseInt(searchQuery) });
      }

      results.sellers = await prisma.seller.findMany({
        where: sellerSearchConditions,
        take: searchLimit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          status: true,
          properties: {
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          assignedAgent: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Search Tasks
    if (type === 'all' || type === 'tasks') {
      const taskSearchConditions = {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } }
        ]
      };

      if (isId) {
        taskSearchConditions.OR.push({ id: parseInt(searchQuery) });
      }

      results.tasks = await prisma.task.findMany({
        where: taskSearchConditions,
        take: searchLimit,
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          priority: true,
          status: true,
          taskType: true,
          buyer: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          seller: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          property: {
            select: {
              title: true,
              address: true
            }
          },
          assignedAgent: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { dueDate: 'asc' }
      });
    }

    // Calculate total results
    const totalResults = results.properties.length + 
                        results.buyers.length + 
                        results.sellers.length + 
                        results.tasks.length;

    res.json({
      query: searchQuery,
      type,
      totalResults,
      results
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchQuery = q.trim();
    let suggestions = [];

    // Property suggestions
    if (type === 'all' || type === 'properties') {
      const propertyTitles = await prisma.property.findMany({
        where: {
          title: { contains: searchQuery, mode: 'insensitive' }
        },
        take: 5,
        select: {
          id: true,
          title: true,
          district: true
        }
      });

      suggestions.push(...propertyTitles.map(p => ({
        type: 'property',
        id: p.id,
        label: `${p.title} - ${p.district}`,
        value: p.title
      })));
    }

    // Buyer suggestions
    if (type === 'all' || type === 'buyers') {
      const buyerNames = await prisma.buyer.findMany({
        where: {
          OR: [
            { firstName: { contains: searchQuery, mode: 'insensitive' } },
            { lastName: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true
        }
      });

      suggestions.push(...buyerNames.map(b => ({
        type: 'buyer',
        id: b.id,
        label: `${b.firstName} ${b.lastName} - ${b.phone}`,
        value: `${b.firstName} ${b.lastName}`
      })));
    }

    // District suggestions
    if (type === 'all' || type === 'properties') {
      const districts = await prisma.property.groupBy({
        by: ['district'],
        where: {
          district: { contains: searchQuery, mode: 'insensitive' }
        },
        take: 3
      });

      suggestions.push(...districts.map(d => ({
        type: 'district',
        label: d.district,
        value: d.district
      })));
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.label === suggestion.label)
      )
      .slice(0, 10);

    res.json({ suggestions: uniqueSuggestions });
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
});

// GET /api/search/quick/:id - Quick search by ID across all entities
router.get('/quick/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const entityId = parseInt(id);

    if (isNaN(entityId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Search across all entities
    const [property, buyer, seller, task] = await Promise.all([
      prisma.property.findUnique({
        where: { id: entityId },
        select: {
          id: true,
          title: true,
          address: true,
          district: true,
          propertyType: true,
          status: true,
          priceEur: true,
          monthlyRentEur: true
        }
      }),
      prisma.buyer.findUnique({
        where: { id: entityId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true
        }
      }),
      prisma.seller.findUnique({
        where: { id: entityId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true
        }
      }),
      prisma.task.findUnique({
        where: { id: entityId },
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
          status: true
        }
      })
    ]);

    // Return the first found entity
    if (property) {
      return res.json({ type: 'property', entity: property });
    }
    if (buyer) {
      return res.json({ type: 'buyer', entity: buyer });
    }
    if (seller) {
      return res.json({ type: 'seller', entity: seller });
    }
    if (task) {
      return res.json({ type: 'task', entity: task });
    }

    res.status(404).json({ error: 'No entity found with this ID' });
  } catch (error) {
    console.error('Error performing quick search:', error);
    res.status(500).json({ error: 'Failed to perform quick search' });
  }
});

module.exports = router;