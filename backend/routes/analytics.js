const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/analytics/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalProperties,
      availableProperties,
      soldProperties,
      rentedProperties,
      managedProperties,
      totalBuyers,
      activeBuyers,
      convertedBuyers,
      totalSellers,
      activeSellers,
      totalTasks,
      pendingTasks,
      overdureTasks,
      completedTasks,
      monthlyRevenue,
      averagePrice,
      topViewedProperties,
      recentTasks
    ] = await Promise.all([
      // Properties stats
      prisma.property.count(),
      prisma.property.count({ where: { status: 'available' } }),
      prisma.property.count({ where: { status: 'sold' } }),
      prisma.property.count({ where: { status: 'rented' } }),
      prisma.property.count({ where: { status: 'managed' } }),

      // Buyers stats
      prisma.buyer.count(),
      prisma.buyer.count({ where: { status: 'active' } }),
      prisma.buyer.count({ where: { status: 'converted' } }),

      // Sellers stats
      prisma.seller.count(),
      prisma.seller.count({ where: { status: 'active' } }),

      // Tasks stats
      prisma.task.count(),
      prisma.task.count({ where: { status: 'pending' } }),
      prisma.task.count({ 
        where: { 
          status: 'pending',
          dueDate: { lt: new Date() }
        } 
      }),
      prisma.task.count({ where: { status: 'completed' } }),

      // Financial stats
      prisma.property.aggregate({
        where: { 
          propertyType: 'managed',
          status: 'managed'
        },
        _sum: {
          monthlyRentEur: true
        }
      }),

      prisma.property.aggregate({
        where: { 
          propertyType: 'sale',
          status: 'available',
          priceEur: { not: null }
        },
        _avg: {
          priceEur: true
        }
      }),

      // Top viewed properties
      prisma.property.findMany({
        take: 5,
        orderBy: { viewings: 'desc' },
        select: {
          id: true,
          title: true,
          district: true,
          viewings: true,
          status: true
        }
      }),

      // Recent tasks
      prisma.task.findMany({
        take: 5,
        where: { status: 'pending' },
        orderBy: { dueDate: 'asc' },
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
          assignedAgent: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    // Calculate monthly revenue from management fees
    const managementRevenue = (monthlyRevenue._sum.monthlyRentEur || 0) * 0.08; // 8% average fee

    res.json({
      properties: {
        total: totalProperties,
        available: availableProperties,
        sold: soldProperties,
        rented: rentedProperties,
        managed: managedProperties,
        averagePrice: averagePrice._avg.priceEur || 0
      },
      buyers: {
        total: totalBuyers,
        active: activeBuyers,
        converted: convertedBuyers,
        conversionRate: totalBuyers > 0 ? ((convertedBuyers / totalBuyers) * 100).toFixed(1) : 0
      },
      sellers: {
        total: totalSellers,
        active: activeSellers
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        overdue: overdureTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0
      },
      revenue: {
        monthlyManagement: managementRevenue,
        totalRental: monthlyRevenue._sum.monthlyRentEur || 0
      },
      topViewedProperties,
      recentTasks
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// GET /api/analytics/properties - Get property analytics
router.get('/properties', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [
      propertiesByType,
      propertiesByDistrict,
      propertiesByStatus,
      averagePriceByType,
      recentlyAdded,
      mostViewed,
      priceRangeDistribution
    ] = await Promise.all([
      // Properties by type
      prisma.property.groupBy({
        by: ['propertyType'],
        _count: {
          id: true
        }
      }),

      // Properties by district
      prisma.property.groupBy({
        by: ['district'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      }),

      // Properties by status
      prisma.property.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),

      // Average price by type
      prisma.property.groupBy({
        by: ['propertyType'],
        _avg: {
          priceEur: true,
          monthlyRentEur: true
        },
        where: {
          OR: [
            { priceEur: { not: null } },
            { monthlyRentEur: { not: null } }
          ]
        }
      }),

      // Recently added properties
      prisma.property.count({
        where: {
          createdAt: {
            gte: daysAgo
          }
        }
      }),

      // Most viewed properties
      prisma.property.findMany({
        take: 10,
        orderBy: { viewings: 'desc' },
        select: {
          id: true,
          title: true,
          district: true,
          viewings: true,
          priceEur: true,
          monthlyRentEur: true,
          propertyType: true
        }
      }),

      // Price range distribution for sale properties
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN price_eur < 50000 THEN 'Under 50k'
            WHEN price_eur BETWEEN 50000 AND 100000 THEN '50k-100k'
            WHEN price_eur BETWEEN 100000 AND 200000 THEN '100k-200k'
            WHEN price_eur BETWEEN 200000 AND 300000 THEN '200k-300k'
            WHEN price_eur > 300000 THEN 'Over 300k'
          END as price_range,
          COUNT(*) as count
        FROM properties 
        WHERE property_type = 'sale' AND price_eur IS NOT NULL
        GROUP BY price_range
        ORDER BY MIN(price_eur)
      `
    ]);

    res.json({
      propertiesByType,
      propertiesByDistrict,
      propertiesByStatus,
      averagePriceByType,
      recentlyAdded,
      mostViewed,
      priceRangeDistribution
    });
  } catch (error) {
    console.error('Error fetching property analytics:', error);
    res.status(500).json({ error: 'Failed to fetch property analytics' });
  }
});

// GET /api/analytics/revenue - Get revenue analytics
router.get('/revenue', async (req, res) => {
  try {
    const [
      managedProperties,
      totalMonthlyRent,
      averageManagementFee,
      revenueByProperty
    ] = await Promise.all([
      // Managed properties count
      prisma.property.count({
        where: { propertyType: 'managed' }
      }),

      // Total monthly rent from managed properties
      prisma.property.aggregate({
        where: { 
          propertyType: 'managed',
          status: 'managed'
        },
        _sum: {
          monthlyRentEur: true
        }
      }),

      // Average management fee percentage
      prisma.property.aggregate({
        where: { 
          propertyType: 'managed',
          managementFeePercent: { not: null }
        },
        _avg: {
          managementFeePercent: true
        }
      }),

      // Revenue breakdown by property
      prisma.property.findMany({
        where: { 
          propertyType: 'managed',
          status: 'managed',
          monthlyRentEur: { not: null },
          managementFeePercent: { not: null }
        },
        select: {
          id: true,
          title: true,
          district: true,
          monthlyRentEur: true,
          managementFeePercent: true,
          seller: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    const avgFeePercent = averageManagementFee._avg.managementFeePercent || 8;
    const totalRent = totalMonthlyRent._sum.monthlyRentEur || 0;
    const estimatedMonthlyRevenue = totalRent * (avgFeePercent / 100);

    // Calculate revenue per property
    const revenueBreakdown = revenueByProperty.map(property => ({
      ...property,
      monthlyRevenue: (property.monthlyRentEur * (property.managementFeePercent / 100)).toFixed(2)
    }));

    res.json({
      managedProperties,
      totalMonthlyRent: totalRent,
      estimatedMonthlyRevenue,
      averageManagementFee: avgFeePercent,
      estimatedYearlyRevenue: estimatedMonthlyRevenue * 12,
      revenueBreakdown
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// GET /api/analytics/performance - Get agent performance
router.get('/performance', async (req, res) => {
  try {
    const { agentId, period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    let whereClause = {
      createdAt: {
        gte: daysAgo
      }
    };

    if (agentId) {
      whereClause.assignedAgentId = parseInt(agentId);
    }

    const [
      agentStats,
      taskCompletion,
      propertyPerformance
    ] = await Promise.all([
      // Agent statistics
      prisma.user.findMany({
        where: {
          role: 'agent',
          ...(agentId && { id: parseInt(agentId) })
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          assignedProperties: {
            where: { createdAt: { gte: daysAgo } },
            select: { id: true }
          },
          assignedBuyers: {
            where: { createdAt: { gte: daysAgo } },
            select: { id: true, status: true }
          },
          assignedSellers: {
            where: { createdAt: { gte: daysAgo } },
            select: { id: true }
          },
          assignedTasks: {
            where: { createdAt: { gte: daysAgo } },
            select: { id: true, status: true }
          }
        }
      }),

      // Task completion rates
      prisma.task.groupBy({
        by: ['assignedAgentId', 'status'],
        where: whereClause,
        _count: {
          id: true
        }
      }),

      // Property performance
      prisma.property.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          status: true,
          viewings: true,
          assignedAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    res.json({
      agentStats,
      taskCompletion,
      propertyPerformance
    });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ error: 'Failed to fetch performance analytics' });
  }
});

module.exports = router;