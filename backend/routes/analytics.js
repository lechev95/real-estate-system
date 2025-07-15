// backend/routes/analytics.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/analytics/dashboard - Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Get basic counts
    const [
      totalProperties,
      totalBuyers,
      totalSellers,
      activeBuyers,
      availableProperties,
      rentedProperties,
      managedProperties,
      pendingTasks,
      overdueTasks,
      completedTasksThisMonth
    ] = await Promise.all([
      prisma.property.count(),
      prisma.buyer.count(),
      prisma.seller.count(),
      prisma.buyer.count({ where: { status: 'active' } }),
      prisma.property.count({ where: { status: 'available' } }),
      prisma.property.count({ where: { status: 'rented' } }),
      prisma.property.count({ where: { status: 'managed' } }),
      prisma.task.count({ where: { status: 'pending' } }),
      prisma.task.count({ 
        where: { 
          AND: [
            { status: { not: 'completed' } },
            { dueDate: { lt: new Date() } }
          ]
        } 
      }),
      prisma.task.count({ 
        where: { 
          AND: [
            { status: 'completed' },
            { completedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
          ]
        } 
      })
    ]);

    // Calculate revenue metrics
    const saleProperties = await prisma.property.findMany({
      where: { propertyType: 'sale', status: 'available' },
      select: { priceEur: true }
    });

    const rentProperties = await prisma.property.findMany({
      where: { 
        OR: [
          { propertyType: 'rent', status: 'rented' },
          { propertyType: 'managed', status: 'managed' }
        ]
      },
      select: { monthlyRentEur: true, managementFeePercent: true }
    });

    // Calculate total sale inventory value
    const totalSaleValue = saleProperties.reduce((sum, property) => {
      return sum + (parseFloat(property.priceEur) || 0);
    }, 0);

    // Calculate monthly rental income
    const monthlyRentalIncome = rentProperties.reduce((sum, property) => {
      const rent = parseFloat(property.monthlyRentEur) || 0;
      const managementFee = parseFloat(property.managementFeePercent) || 0;
      const commission = rent * (managementFee / 100);
      return sum + commission;
    }, 0);

    // Get recent activity
    const recentProperties = await prisma.property.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        propertyType: true,
        status: true,
        priceEur: true,
        monthlyRentEur: true,
        createdAt: true
      }
    });

    const upcomingTasks = await prisma.task.findMany({
      where: {
        AND: [
          { status: { not: 'completed' } },
          { dueDate: { gte: new Date() } },
          { dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } } // Next 7 days
        ]
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
      include: {
        assignedAgent: {
          select: { firstName: true, lastName: true }
        },
        property: {
          select: { title: true }
        }
      }
    });

    // Calculate property distribution by type
    const propertyDistribution = {
      sale: await prisma.property.count({ where: { propertyType: 'sale' } }),
      rent: await prisma.property.count({ where: { propertyType: 'rent' } }),
      managed: await prisma.property.count({ where: { propertyType: 'managed' } })
    };

    // Calculate buyer status distribution
    const buyerDistribution = {
      active: await prisma.buyer.count({ where: { status: 'active' } }),
      potential: await prisma.buyer.count({ where: { status: 'potential' } }),
      inactive: await prisma.buyer.count({ where: { status: 'inactive' } }),
      converted: await prisma.buyer.count({ where: { status: 'converted' } })
    };

    // Calculate average property metrics
    const avgPropertyMetrics = await prisma.property.aggregate({
      _avg: {
        area: true,
        rooms: true,
        viewings: true
      }
    });

    // Get most viewed properties
    const mostViewedProperties = await prisma.property.findMany({
      take: 5,
      orderBy: { viewings: 'desc' },
      select: {
        id: true,
        title: true,
        address: true,
        viewings: true,
        propertyType: true,
        status: true
      }
    });

    const dashboardData = {
      kpis: {
        totalProperties,
        totalBuyers,
        totalSellers,
        activeBuyers,
        availableProperties,
        rentedProperties,
        managedProperties,
        pendingTasks,
        overdueTasks,
        completedTasksThisMonth,
        totalSaleValue: Math.round(totalSaleValue),
        monthlyRentalIncome: Math.round(monthlyRentalIncome)
      },
      recentActivity: {
        properties: recentProperties,
        upcomingTasks
      },
      distributions: {
        properties: propertyDistribution,
        buyers: buyerDistribution
      },
      metrics: {
        averageArea: Math.round(avgPropertyMetrics._avg.area || 0),
        averageRooms: Math.round(avgPropertyMetrics._avg.rooms || 0),
        averageViewings: Math.round(avgPropertyMetrics._avg.viewings || 0)
      },
      topProperties: mostViewedProperties,
      generatedAt: new Date().toISOString()
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// GET /api/analytics/kpis - Get just KPI metrics
router.get('/kpis', async (req, res) => {
  try {
    const [
      totalProperties,
      totalBuyers,
      activeBuyers,
      pendingTasks,
      overdueTasks,
      monthlyRevenue
    ] = await Promise.all([
      prisma.property.count(),
      prisma.buyer.count(),
      prisma.buyer.count({ where: { status: 'active' } }),
      prisma.task.count({ where: { status: 'pending' } }),
      prisma.task.count({ 
        where: { 
          AND: [
            { status: { not: 'completed' } },
            { dueDate: { lt: new Date() } }
          ]
        } 
      }),
      // Calculate this month's potential commission
      prisma.property.findMany({
        where: { 
          OR: [
            { propertyType: 'rent', status: 'rented' },
            { propertyType: 'managed', status: 'managed' }
          ]
        },
        select: { monthlyRentEur: true, managementFeePercent: true }
      }).then(properties => {
        return properties.reduce((sum, property) => {
          const rent = parseFloat(property.monthlyRentEur) || 0;
          const managementFee = parseFloat(property.managementFeePercent) || 0;
          return sum + (rent * (managementFee / 100));
        }, 0);
      })
    ]);

    res.json({
      totalProperties,
      totalBuyers,
      activeBuyers,
      pendingTasks,
      overdueTasks,
      monthlyRevenue: Math.round(monthlyRevenue),
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

// GET /api/analytics/properties - Property analytics
router.get('/properties', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Property metrics by time period
    const newProperties = await prisma.property.count({
      where: { createdAt: { gte: startDate } }
    });

    const propertiesByType = await prisma.property.groupBy({
      by: ['propertyType'],
      _count: { id: true },
      where: { createdAt: { gte: startDate } }
    });

    const propertiesByStatus = await prisma.property.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const propertiesByDistrict = await prisma.property.groupBy({
      by: ['district'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    // Price analytics
    const priceStats = await prisma.property.aggregate({
      where: { propertyType: 'sale' },
      _avg: { priceEur: true },
      _min: { priceEur: true },
      _max: { priceEur: true }
    });

    const rentStats = await prisma.property.aggregate({
      where: { 
        OR: [
          { propertyType: 'rent' },
          { propertyType: 'managed' }
        ]
      },
      _avg: { monthlyRentEur: true },
      _min: { monthlyRentEur: true },
      _max: { monthlyRentEur: true }
    });

    res.json({
      period: `${days} days`,
      newProperties,
      distributions: {
        byType: propertiesByType,
        byStatus: propertiesByStatus,
        byDistrict: propertiesByDistrict
      },
      priceAnalytics: {
        sale: {
          average: Math.round(parseFloat(priceStats._avg.priceEur) || 0),
          minimum: Math.round(parseFloat(priceStats._min.priceEur) || 0),
          maximum: Math.round(parseFloat(priceStats._max.priceEur) || 0)
        },
        rent: {
          average: Math.round(parseFloat(rentStats._avg.monthlyRentEur) || 0),
          minimum: Math.round(parseFloat(rentStats._min.monthlyRentEur) || 0),
          maximum: Math.round(parseFloat(rentStats._max.monthlyRentEur) || 0)
        }
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching property analytics:', error);
    res.status(500).json({ error: 'Failed to fetch property analytics' });
  }
});

// GET /api/analytics/performance - Agent performance analytics
router.get('/performance', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Agent performance metrics
    const agentStats = await prisma.user.findMany({
      include: {
        assignedProperties: {
          where: { createdAt: { gte: startDate } },
          select: { id: true, propertyType: true }
        },
        assignedBuyers: {
          where: { createdAt: { gte: startDate } },
          select: { id: true, status: true }
        },
        assignedTasks: {
          where: { createdAt: { gte: startDate } },
          select: { id: true, status: true }
        }
      }
    });

    const performanceData = agentStats.map(agent => ({
      agentId: agent.id,
      name: `${agent.firstName} ${agent.lastName}`,
      email: agent.email,
      metrics: {
        newProperties: agent.assignedProperties.length,
        newBuyers: agent.assignedBuyers.length,
        activeBuyers: agent.assignedBuyers.filter(b => b.status === 'active').length,
        completedTasks: agent.assignedTasks.filter(t => t.status === 'completed').length,
        pendingTasks: agent.assignedTasks.filter(t => t.status === 'pending').length
      }
    }));

    res.json({
      period: `${days} days`,
      agents: performanceData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ error: 'Failed to fetch performance analytics' });
  }
});

module.exports = router;