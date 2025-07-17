// backend/routes/analytics.js
// ===================================

const express = require('express');
const analyticsRouter = express.Router();

// GET /api/analytics/overview - Get dashboard overview
analyticsRouter.get('/overview', async (req, res) => {
  try {
    console.log('📊 GET /api/analytics/overview - Fetching overview');
    
    const overview = {
      properties: {
        total: 15,
        available: 8,
        sold: 4,
        rented: 3
      },
      buyers: {
        total: 25,
        active: 12,
        potential: 8,
        converted: 5
      },
      revenue: {
        thisMonth: 125000,
        lastMonth: 98000,
        growth: 27.6
      },
      tasks: {
        total: 18,
        pending: 7,
        completed: 11,
        overdue: 2
      }
    };
    
    res.json({
      success: true,
      overview
    });
  } catch (error) {
    console.error('❌ Error fetching analytics overview:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching analytics overview'
    });
  }
});

// GET /api/analytics/properties - Get property analytics
analyticsRouter.get('/properties', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    console.log(`📊 GET /api/analytics/properties - Period: ${period}`);
    
    const analytics = {
      period,
      totalProperties: 15,
      newProperties: 3,
      soldProperties: 2,
      averagePrice: 165000,
      averageDaysOnMarket: 45,
      topAreas: [
        { name: 'Лозенец', count: 5 },
        { name: 'Център', count: 4 },
        { name: 'Витоша', count: 3 }
      ]
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('❌ Error fetching property analytics:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching property analytics'
    });
  }
});

module.exports = analyticsRouter;

