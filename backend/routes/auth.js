// backend/routes/auth.js
// ===================================

const express = require('express');
const authRouter = express.Router();

// GET /api/auth/user - Get current user info
authRouter.get('/user', async (req, res) => {
  try {
    console.log('👤 GET /api/auth/user - Fetching user info');
    
    const user = {
      id: 1,
      firstName: "Мария",
      lastName: "Иванова",
      email: "maria@realestatecrm.bg",
      role: "agent",
      permissions: ["properties:read", "properties:write", "buyers:read", "buyers:write"],
      lastLogin: new Date(),
      isActive: true
    };
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Error fetching user info:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching user info'
    });
  }
});

// PUT /api/auth/profile - Update user profile
authRouter.put('/profile', async (req, res) => {
  try {
    console.log('👤 PUT /api/auth/profile - Updating profile');
    
    const updatedUser = {
      id: 1,
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating profile'
    });
  }
});

// GET /api/auth/permissions - Get user permissions
authRouter.get('/permissions', async (req, res) => {
  try {
    console.log('👤 GET /api/auth/permissions - Fetching permissions');
    
    const permissions = {
      properties: ["read", "write", "delete"],
      buyers: ["read", "write", "delete"],
      sellers: ["read", "write"],
      tasks: ["read", "write", "delete"],
      analytics: ["read"],
      admin: false
    };
    
    res.json({
      success: true,
      permissions
    });
  } catch (error) {
    console.error('❌ Error fetching permissions:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching permissions'
    });
  }
});

module.exports = authRouter;