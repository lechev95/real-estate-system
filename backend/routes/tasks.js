const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    const {
      status,
      priority,
      taskType,
      agentId,
      buyerId,
      sellerId,
      propertyId,
      page = 1,
      limit = 20,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    // Build where clause
    const where = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (taskType) where.taskType = taskType;
    if (agentId) where.assignedAgentId = parseInt(agentId);
    if (buyerId) where.buyerId = parseInt(buyerId);
    if (sellerId) where.sellerId = parseInt(sellerId);
    if (propertyId) where.propertyId = parseInt(propertyId);

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
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
          },
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              district: true
            }
          },
          assignedAgent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take
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
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
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
        },
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            district: true,
            propertyType: true,
            priceEur: true,
            monthlyRentEur: true
          }
        },
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /api/tasks - Create new task
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('dueTime').notEmpty().withMessage('Due time is required'),
  body('priority').isIn(['urgent', 'high', 'medium', 'low']).withMessage('Invalid priority'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Parse time string to Date object
    const dueTime = new Date(`1970-01-01T${req.body.dueTime}:00Z`);

    const task = await prisma.task.create({
      data: {
        ...req.body,
        dueDate: new Date(req.body.dueDate),
        dueTime: dueTime,
        buyerId: req.body.buyerId ? parseInt(req.body.buyerId) : null,
        sellerId: req.body.sellerId ? parseInt(req.body.sellerId) : null,
        propertyId: req.body.propertyId ? parseInt(req.body.propertyId) : null,
        assignedAgentId: req.body.assignedAgentId ? parseInt(req.body.assignedAgentId) : null,
      },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        property: {
          select: {
            id: true,
            title: true
          }
        },
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', [
  body('title').notEmpty().withMessage('Title is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('dueTime').notEmpty().withMessage('Due time is required'),
  body('priority').isIn(['urgent', 'high', 'medium', 'low']).withMessage('Invalid priority'),
  body('status').isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    // Parse time string to Date object
    const dueTime = new Date(`1970-01-01T${req.body.dueTime}:00Z`);

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body,
        dueDate: new Date(req.body.dueDate),
        dueTime: dueTime,
        buyerId: req.body.buyerId ? parseInt(req.body.buyerId) : null,
        sellerId: req.body.sellerId ? parseInt(req.body.sellerId) : null,
        propertyId: req.body.propertyId ? parseInt(req.body.propertyId) : null,
        assignedAgentId: req.body.assignedAgentId ? parseInt(req.body.assignedAgentId) : null,
        updatedAt: new Date()
      },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        property: {
          select: {
            id: true,
            title: true
          }
        },
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// GET /api/tasks/overdue - Get overdue tasks
router.get('/overdue', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await prisma.task.findMany({
      where: {
        status: 'pending',
        dueDate: {
          lt: today
        }
      },
      include: {
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
        },
        property: {
          select: {
            id: true,
            title: true,
            address: true
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
      orderBy: { dueDate: 'asc' }
    });

    res.json(overdueTasks);
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({ error: 'Failed to fetch overdue tasks' });
  }
});

module.exports = router;