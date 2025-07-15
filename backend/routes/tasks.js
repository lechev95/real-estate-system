// backend/routes/tasks.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/tasks - Get all tasks with filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, type, dueDate, page = 1, limit = 20 } = req.query;
    
    const where = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (dueDate) {
      const date = new Date(dueDate);
      where.dueDate = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
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
              address: true
            }
          },
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        },
        orderBy: [
          { status: 'asc' }, // Pending tasks first
          { priority: 'desc' }, // High priority first
          { dueDate: 'asc' } // Earlier due dates first
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.task.count({ where })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    res.json({ tasks, pagination });
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
            district: true
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
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      priority = 'medium',
      status = 'pending',
      dueDate,
      assignedAgentId,
      propertyId,
      buyerId
    } = req.body;

    // Validation
    if (!title || !type || !dueDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, type, dueDate' 
      });
    }

    // Validate enum values
    const validTypes = ['call', 'viewing', 'meeting', 'document', 'follow_up', 'other'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid task type' });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority level' });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Validate due date
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid due date format' });
    }

    const taskData = {
      title,
      description: description || '',
      type,
      priority,
      status,
      dueDate: dueDateObj,
      assignedAgentId: assignedAgentId ? parseInt(assignedAgentId) : 1, // Default to first agent
      propertyId: propertyId ? parseInt(propertyId) : null,
      buyerId: buyerId ? parseInt(buyerId) : null
    };

    const task = await prisma.task.create({
      data: taskData,
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
            address: true
          }
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert numeric fields
    if (updateData.assignedAgentId) updateData.assignedAgentId = parseInt(updateData.assignedAgentId);
    if (updateData.propertyId) updateData.propertyId = parseInt(updateData.propertyId);
    if (updateData.buyerId) updateData.buyerId = parseInt(updateData.buyerId);

    // Convert date fields
    if (updateData.dueDate) {
      const dueDateObj = new Date(updateData.dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({ error: 'Invalid due date format' });
      }
      updateData.dueDate = dueDateObj;
    }

    // Validate enum values if provided
    if (updateData.type) {
      const validTypes = ['call', 'viewing', 'meeting', 'document', 'follow_up', 'other'];
      if (!validTypes.includes(updateData.type)) {
        return res.status(400).json({ error: 'Invalid task type' });
      }
    }

    if (updateData.priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(updateData.priority)) {
        return res.status(400).json({ error: 'Invalid priority level' });
      }
    }

    if (updateData.status) {
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      // Set completion date if status changed to completed
      if (updateData.status === 'completed') {
        updateData.completedAt = new Date();
      }
    }

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
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
            address: true
          }
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
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

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Delete the task
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

// PATCH /api/tasks/:id/complete - Mark task as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        status: 'completed',
        completedAt: new Date(),
        ...(notes && { description: notes })
      },
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
            address: true
          }
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error completing task:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// PATCH /api/tasks/:id/status - Update task status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updateData = { status };
    
    // Set completion date if status is completed
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    // Add notes if provided
    if (notes) {
      updateData.description = notes;
    }

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
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
            address: true
          }
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating status:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/tasks/overdue - Get overdue tasks
router.get('/overdue', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          { status: { not: 'completed' } },
          { dueDate: { lt: new Date() } }
        ]
      },
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
            address: true
          }
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json({ tasks, count: tasks.length });
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({ error: 'Failed to fetch overdue tasks' });
  }
});

module.exports = router;