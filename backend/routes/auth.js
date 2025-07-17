// backend/routes/auth.js - COMPLETE AUTH ROUTES
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to clean user data
const cleanUserData = (data) => {
  const cleaned = {};
  
  // Required fields
  if (data.firstName) cleaned.firstName = data.firstName.toString().trim();
  if (data.lastName) cleaned.lastName = data.lastName.toString().trim();
  if (data.email) cleaned.email = data.email.toString().trim().toLowerCase();
  
  // Optional fields
  cleaned.role = data.role?.toString() || 'agent';
  cleaned.status = data.status?.toString() || 'active';
  
  if (data.phone && typeof data.phone === 'string') {
    cleaned.phone = data.phone.trim();
  }
  
  if (data.department && typeof data.department === 'string') {
    cleaned.department = data.department.trim();
  }
  
  if (data.position && typeof data.position === 'string') {
    cleaned.position = data.position.trim();
  }
  
  if (data.hireDate) {
    const date = new Date(data.hireDate);
    if (!isNaN(date.getTime())) {
      cleaned.hireDate = date;
    }
  }
  
  return cleaned;
};

// GET /api/auth/users - Get all users/agents
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status, department } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (role && role !== 'all') where.role = role;
    if (status && status !== 'all') where.status = status;
    if (department) where.department = { contains: department, mode: 'insensitive' };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          department: true,
          position: true,
          hireDate: true,
          createdAt: true,
          _count: {
            assignedProperties: true,
            assignedBuyers: true,
            assignedTasks: true
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
});

// GET /api/auth/users/:id - Get user by ID with detailed info
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        department: true,
        position: true,
        hireDate: true,
        createdAt: true,
        assignedProperties: {
          select: {
            id: true,
            title: true,
            propertyType: true,
            status: true,
            address: true,
            city: true,
            priceEur: true,
            monthlyRentEur: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        assignedBuyers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true,
            phone: true,
            preferredPropertyType: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            property: {
              select: { title: true }
            }
          },
          orderBy: { dueDate: 'asc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      details: error.message 
    });
  }
});

// POST /api/auth/users - Create new user/agent
router.post('/users', async (req, res) => {
  try {
    console.log('Creating user with data:', req.body);
    
    const cleanedData = cleanUserData(req.body);
    console.log('Cleaned user data:', cleanedData);
    
    // Validation
    if (!cleanedData.firstName) {
      return res.status(400).json({ error: 'First name is required' });
    }
    
    if (!cleanedData.lastName) {
      return res.status(400).json({ error: 'Last name is required' });
    }
    
    if (!cleanedData.email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!cleanedData.email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanedData.email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newUser = await prisma.user.create({
      data: cleanedData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        department: true,
        position: true,
        hireDate: true,
        createdAt: true
      }
    });

    console.log('Created user:', newUser);
    res.status(201).json(newUser);

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message 
    });
  }
});

// PUT /api/auth/users/:id - Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    console.log(`Updating user ${userId} with data:`, req.body);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cleanedData = cleanUserData(req.body);
    console.log('Cleaned update data:', cleanedData);
    
    // Email validation and uniqueness check
    if (cleanedData.email) {
      if (!cleanedData.email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
      
      if (cleanedData.email !== existingUser.email) {
        const duplicateUser = await prisma.user.findUnique({
          where: { email: cleanedData.email }
        });
        
        if (duplicateUser) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }
    }
    
    // Remove undefined/null values for update
    const updateData = {};
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] !== undefined && cleanedData[key] !== null) {
        updateData[key] = cleanedData[key];
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        department: true,
        position: true,
        hireDate: true,
        createdAt: true
      }
    });

    console.log('Updated user:', updatedUser);
    res.json(updatedUser);

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error.message 
    });
  }
});

// DELETE /api/auth/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        assignedProperties: true,
        assignedBuyers: true,
        assignedTasks: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has assigned items
    const hasAssignments = existingUser.assignedProperties.length > 0 || 
                          existingUser.assignedBuyers.length > 0 || 
                          existingUser.assignedTasks.length > 0;

    if (hasAssignments) {
      return res.status(400).json({ 
        error: 'Cannot delete user with assigned properties, buyers, or tasks',
        assignments: {
          properties: existingUser.assignedProperties.length,
          buyers: existingUser.assignedBuyers.length,
          tasks: existingUser.assignedTasks.length
        }
      });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ 
      message: 'User deleted successfully',
      deletedId: userId 
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error.message 
    });
  }
});

// PUT /api/auth/users/:id/deactivate - Deactivate user
router.put('/users/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'inactive' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true
      }
    });

    res.json(updatedUser);

  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ 
      error: 'Failed to deactivate user',
      details: error.message 
    });
  }
});

// PUT /api/auth/users/:id/activate - Activate user
router.put('/users/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'active' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true
      }
    });

    res.json(updatedUser);

  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ 
      error: 'Failed to activate user',
      details: error.message 
    });
  }
});

// GET /api/auth/users/:id/performance - Get user performance metrics
router.get('/users/:id/performance', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query;
    const userId = parseInt(id);
    const days = parseInt(period);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalProperties,
      totalBuyers,
      totalTasks,
      completedTasks,
      overdueTasks,
      newPropertiesThisPeriod,
      newBuyersThisPeriod,
      completedTasksThisPeriod
    ] = await Promise.all([
      prisma.property.count({ where: { assignedAgentId: userId } }),
      prisma.buyer.count({ where: { assignedAgentId: userId } }),
      prisma.task.count({ where: { assignedAgentId: userId } }),
      prisma.task.count({ where: { assignedAgentId: userId, status: 'completed' } }),
      prisma.task.count({ 
        where: { 
          assignedAgentId: userId,
          status: { not: 'completed' },
          dueDate: { lt: new Date() }
        } 
      }),
      prisma.property.count({ 
        where: { 
          assignedAgentId: userId,
          createdAt: { gte: startDate }
        } 
      }),
      prisma.buyer.count({ 
        where: { 
          assignedAgentId: userId,
          createdAt: { gte: startDate }
        } 
      }),
      prisma.task.count({ 
        where: { 
          assignedAgentId: userId,
          status: 'completed',
          completedAt: { gte: startDate }
        } 
      })
    ]);

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueRate = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;

    res.json({
      userId,
      period: `${days} days`,
      metrics: {
        totalProperties,
        totalBuyers,
        totalTasks,
        completedTasks,
        overdueTasks,
        taskCompletionRate,
        overdueRate
      },
      periodMetrics: {
        newProperties: newPropertiesThisPeriod,
        newBuyers: newBuyersThisPeriod,
        completedTasks: completedTasksThisPeriod
      },
      performance: {
        score: Math.round((taskCompletionRate + (100 - overdueRate)) / 2),
        grade: taskCompletionRate >= 90 ? 'A' : 
               taskCompletionRate >= 80 ? 'B' : 
               taskCompletionRate >= 70 ? 'C' : 
               taskCompletionRate >= 60 ? 'D' : 'F'
      }
    });

  } catch (error) {
    console.error('Error fetching user performance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user performance',
      details: error.message 
    });
  }
});

// GET /api/auth/roles - Get available roles
router.get('/roles', async (req, res) => {
  try {
    const roles = [
      { value: 'admin', label: 'Administrator', description: 'Full system access' },
      { value: 'manager', label: 'Manager', description: 'Team management and oversight' },
      { value: 'agent', label: 'Agent', description: 'Property and client management' },
      { value: 'assistant', label: 'Assistant', description: 'Support and administrative tasks' }
    ];

    // Get role counts
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });

    const rolesWithCounts = roles.map(role => ({
      ...role,
      count: roleCounts.find(rc => rc.role === role.value)?._count.id || 0
    }));

    res.json({
      roles: rolesWithCounts,
      total: roleCounts.reduce((sum, rc) => sum + rc._count.id, 0)
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch roles',
      details: error.message 
    });
  }
});

// GET /api/auth/departments - Get departments and team structure
router.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.user.groupBy({
      by: ['department'],
      _count: { id: true },
      where: { 
        department: { not: null },
        status: 'active'
      },
      orderBy: { _count: { id: 'desc' } }
    });

    const positions = await prisma.user.groupBy({
      by: ['position'],
      _count: { id: true },
      where: { 
        position: { not: null },
        status: 'active'
      },
      orderBy: { _count: { id: 'desc' } }
    });

    res.json({
      departments: departments.map(d => ({
        name: d.department,
        count: d._count.id
      })),
      positions: positions.map(p => ({
        name: p.position,
        count: p._count.id
      }))
    });

  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch departments',
      details: error.message 
    });
  }
});

// GET /api/auth/stats - Get user/team statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      recentUsers,
      topPerformers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { status: 'inactive' } }),
      
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      
      prisma.user.findMany({
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          } 
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Top performers based on completed tasks
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          _count: {
            assignedTasks: {
              where: { status: 'completed' }
            }
          }
        },
        orderBy: {
          assignedTasks: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ]);

    res.json({
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.id;
        return acc;
      }, {}),
      recent: recentUsers,
      topPerformers: topPerformers.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        completedTasks: user._count.assignedTasks
      })),
      growth: {
        newThisMonth: recentUsers.length,
        activeRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user statistics',
      details: error.message 
    });
  }
});

module.exports = router;