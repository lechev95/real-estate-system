// backend/routes/tasks.js - COMPLETE TASKS FUNCTIONALITY
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to clean task data
const cleanTaskData = (data) => {
  const cleaned = {};
  
  // Required fields
  if (data.title) cleaned.title = data.title.toString().trim();
  if (data.description) cleaned.description = data.description.toString().trim();
  
  // Status and priority
  cleaned.status = data.status?.toString() || 'pending';
  cleaned.priority = data.priority?.toString() || 'medium';
  cleaned.type = data.type?.toString() || 'general';
  
  // Date fields
  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);
    if (!isNaN(dueDate.getTime())) {
      cleaned.dueDate = dueDate;
    }
  }
  
  if (data.completedAt) {
    const completedAt = new Date(data.completedAt);
    if (!isNaN(completedAt.getTime())) {
      cleaned.completedAt = completedAt;
    }
  }
  
  // ID fields for relationships
  ['propertyId', 'buyerId', 'sellerId', 'assignedAgentId'].forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const id = parseInt(data[field]);
      if (!isNaN(id) && id > 0) cleaned[field] = id;
    }
  });
  
  // Optional fields
  if (data.notes && typeof data.notes === 'string') {
    cleaned.notes = data.notes.trim();
  }
  
  if (data.location && typeof data.location === 'string') {
    cleaned.location = data.location.trim();
  }
  
  // Duration in minutes
  if (data.estimatedDuration !== undefined && data.estimatedDuration !== null && data.estimatedDuration !== '') {
    const duration = parseInt(data.estimatedDuration);
    if (!isNaN(duration) && duration > 0) cleaned.estimatedDuration = duration;
  }
  
  return cleaned;
};

// GET /api/tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      priority, 
      type, 
      agentId, 
      propertyId, 
      dueDate,
      overdue = 'false'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (type && type !== 'all') where.type = type;
    if (agentId) where.assignedAgentId = parseInt(agentId);
    if (propertyId) where.propertyId = parseInt(propertyId);
    
    if (dueDate) {
      const date = new Date(dueDate);
      if (!isNaN(date.getTime())) {
        where.dueDate = {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lte: new Date(date.setHours(23, 59, 59, 999))
        };
      }
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
              city: true,
              propertyType: true,
              status: true
            }
          },
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true
            }
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true
            }
          }
        },
        orderBy: [
          { status: 'asc' }, // pending first
          { priority: 'desc' }, // high priority first
          { dueDate: 'asc' } // earliest due date first
        ]
      }),
      prisma.task.count({ where })
    ]);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tasks',
      details: error.message 
    });
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);
    
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedAgent: true,
        property: true,
        buyer: true,
        seller: true
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);

  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ 
      error: 'Failed to fetch task',
      details: error.message 
    });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    console.log('Creating task with data:', req.body);
    
    const cleanedData = cleanTaskData(req.body);
    console.log('Cleaned task data:', cleanedData);
    
    // Validation
    if (!cleanedData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!cleanedData.description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // Set default due date if not provided (tomorrow)
    if (!cleanedData.dueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
      cleanedData.dueDate = tomorrow;
    }

    const newTask = await prisma.task.create({
      data: cleanedData,
      include: {
        assignedAgent: true,
        property: true,
        buyer: true,
        seller: true
      }
    });

    console.log('Created task:', newTask);
    res.status(201).json(newTask);

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      error: 'Failed to create task',
      details: error.message 
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);
    
    console.log(`Updating task ${taskId} with data:`, req.body);
    
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const cleanedData = cleanTaskData(req.body);
    console.log('Cleaned update data:', cleanedData);
    
    // Auto-set completedAt when status changes to completed
    if (cleanedData.status === 'completed' && existingTask.status !== 'completed') {
      cleanedData.completedAt = new Date();
    } else if (cleanedData.status !== 'completed' && existingTask.status === 'completed') {
      cleanedData.completedAt = null;
    }
    
    // Remove undefined/null values for update
    const updateData = {};
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] !== undefined) {
        updateData[key] = cleanedData[key];
      }
    });
    
    console.log('Final update data:', updateData);

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignedAgent: true,
        property: true,
        buyer: true,
        seller: true
      }
    });

    console.log('Updated task:', updatedTask);
    res.json(updatedTask);

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ 
      error: 'Failed to update task',
      details: error.message 
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);
    
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ 
      message: 'Task deleted successfully',
      deletedId: taskId 
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      error: 'Failed to delete task',
      details: error.message 
    });
  }
});

// PUT /api/tasks/:id/complete - Mark task as completed
router.put('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const taskId = parseInt(id);
    
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const updateData = {
      status: 'completed',
      completedAt: new Date()
    };
    
    if (notes) {
      updateData.notes = notes.toString().trim();
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignedAgent: true,
        property: true,
        buyer: true,
        seller: true
      }
    });

    res.json(updatedTask);

  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ 
      error: 'Failed to complete task',
      details: error.message 
    });
  }
});

// PUT /api/tasks/:id/reopen - Reopen completed task
router.put('/:id/reopen', async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);
    
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'pending',
        completedAt: null
      },
      include: {
        assignedAgent: true,
        property: true,
        buyer: true,
        seller: true
      }
    });

    res.json(updatedTask);

  } catch (error) {
    console.error('Error reopening task:', error);
    res.status(500).json({ 
      error: 'Failed to reopen task',
      details: error.message 
    });
  }
});

// GET /api/tasks/overdue - Get overdue tasks
router.get('/overdue/list', async (req, res) => {
  try {
    const { agentId } = req.query;
    
    const where = {
      dueDate: { lt: new Date() },
      status: { not: 'completed' }
    };
    
    if (agentId) {
      where.assignedAgentId = parseInt(agentId);
    }

    const overdueTasks = await prisma.task.findMany({
      where,
      include: {
        assignedAgent: true,
        property: true,
        buyer: true,
        seller: true
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({
      tasks: overdueTasks,
      count: overdueTasks.length
    });

  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch overdue tasks',
      details: error.message 
    });
  }
});

// GET /api/tasks/upcoming - Get upcoming tasks (next 7 days)
router.get('/upcoming/list', async (req, res) => {
  try {
    const { agentId, days = 7 } = req.query;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));
    
    const where = {
      dueDate: {
        gte: startDate,
        lte: endDate
      },
      status: { not: 'completed' }
    };
    
    if (agentId) {
      where.assignedAgentId = parseInt(agentId);
    }

    const upcomingTasks = await prisma.task.findMany({
      where,
      include: {
        assignedAgent: true,
        property: true,
        buyer: true,
        seller: true
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({
      tasks: upcomingTasks,
      count: upcomingTasks.length,
      period: `${days} days`
    });

  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch upcoming tasks',
      details: error.message 
    });
  }
});

// GET /api/tasks/summary - Get tasks summary
router.get('/summary/stats', async (req, res) => {
  try {
    const { agentId } = req.query;
    
    const baseWhere = agentId ? { assignedAgentId: parseInt(agentId) } : {};
    
    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      todayTasks,
      thisWeekTasks
    ] = await Promise.all([
      prisma.task.count({ where: baseWhere }),
      prisma.task.count({ where: { ...baseWhere, status: 'pending' } }),
      prisma.task.count({ where: { ...baseWhere, status: 'in_progress' } }),
      prisma.task.count({ where: { ...baseWhere, status: 'completed' } }),
      prisma.task.count({ 
        where: { 
          ...baseWhere, 
          dueDate: { lt: new Date() },
          status: { not: 'completed' }
        } 
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          dueDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          dueDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
            lte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6))
          }
        }
      })
    ]);

    res.json({
      total: totalTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completed: completedTasks,
      overdue: overdueTasks,
      today: todayTasks,
      thisWeek: thisWeekTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    });

  } catch (error) {
    console.error('Error fetching tasks summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tasks summary',
      details: error.message 
    });
  }
});

module.exports = router;