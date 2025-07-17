// backend/routes/tasks.js
const express = require('express');
const router = express.Router();

let tasks = [
  {
    id: 1,
    title: "Покажи апартамент на ул. Раковски",
    description: "Среща с потенциален купувач",
    priority: "high",
    status: "pending",
    dueDate: new Date('2024-02-15'),
    propertyId: 1,
    buyerId: 1,
    agentId: 1,
    isCompleted: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

let nextId = 2;

// GET /api/tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    console.log('📊 GET /api/tasks - Fetching all tasks');
    res.json({
      success: true,
      tasks,
      total: tasks.length
    });
  } catch (error) {
    console.error('❌ Error fetching tasks:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching tasks'
    });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/tasks - Creating new task');
    const newTask = {
      id: nextId++,
      ...req.body,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    tasks.push(newTask);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    console.error('❌ Error creating task:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating task'
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      task: tasks[taskIndex]
    });
  } catch (error) {
    console.error('❌ Error updating task:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating task'
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (error) {
    console.error('❌ Error deleting task:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting task'
    });
  }
});

// POST /api/tasks/:id/complete - Mark task as completed
router.post('/:id/complete', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    tasks[taskIndex].isCompleted = true;
    tasks[taskIndex].status = 'completed';
    tasks[taskIndex].updatedAt = new Date();
    
    res.json({
      success: true,
      message: 'Task marked as completed',
      task: tasks[taskIndex]
    });
  } catch (error) {
    console.error('❌ Error completing task:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while completing task'
    });
  }
});

module.exports = router;
