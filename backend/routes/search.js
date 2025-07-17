// backend/routes/search.js
// ===================================

const express = require('express');
const searchRouter = express.Router();

// GET /api/search - Global search
searchRouter.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      });
    }
    
    console.log(`🔍 GET /api/search - Query: ${query}`);
    
    // Mock search results
    const results = {
      properties: [
        {
          id: 1,
          title: "Тристаен апартамент в Лозенец",
          type: "property"
        }
      ],
      buyers: [
        {
          id: 1,
          name: "Мария Стоянова",
          type: "buyer"
        }
      ],
      sellers: [
        {
          id: 1,
          name: "Иван Петров",
          type: "seller"
        }
      ]
    };
    
    res.json({
      success: true,
      query,
      results
    });
  } catch (error) {
    console.error('❌ Error performing search:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while searching'
    });
  }
});

// POST /api/search/properties - Advanced property search
searchRouter.post('/properties', async (req, res) => {
  try {
    const criteria = req.body;
    console.log('🔍 POST /api/search/properties - Advanced search');
    
    // Mock advanced search results
    const properties = [
      {
        id: 1,
        title: "Тристаен апартамент в Лозенец",
        priceEur: 165000,
        area: 120,
        rooms: 3
      }
    ];
    
    res.json({
      success: true,
      criteria,
      properties,
      total: properties.length
    });
  } catch (error) {
    console.error('❌ Error performing advanced property search:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while searching properties'
    });
  }
});

module.exports = searchRouter;
