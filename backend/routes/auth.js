// backend/routes/auth.js - Fixed with shared database
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'myucons_secret_key_2025';

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Authentication middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Use the shared database instance from app.locals
  const db = req.app.locals.db;

  db.get(
    'SELECT * FROM users WHERE email = ? AND isActive = 1',
    [email.toLowerCase()],
    (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Password comparison error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user);
        
        // Remove password from response
        const { password: pwd, ...userWithoutPassword } = user;
        
        res.json({
          message: 'Login successful',
          token,
          user: userWithoutPassword
        });
      });
    }
  );
});

// Get current user endpoint
router.get('/me', authenticateToken, (req, res) => {
  const db = req.app.locals.db;
  
  db.get(
    'SELECT id, email, firstName, lastName, role, isActive, createdAt FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    }
  );
});

// Change password endpoint
router.put('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const db = req.app.locals.db;

  db.get(
    'SELECT * FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!isMatch) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }

        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({ error: 'Internal server error' });
          }

          db.run(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Internal server error' });
              }

              res.json({ message: 'Password changed successfully' });
            }
          );
        });
      });
    }
  );
});

// Admin Routes - User Management

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  const db = req.app.locals.db;
  
  db.all(
    'SELECT id, email, firstName, lastName, role, isActive, createdAt FROM users ORDER BY createdAt DESC',
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ users });
    }
  );
});

// Create new user (admin only)
router.post('/users', authenticateToken, requireAdmin, (req, res) => {
  const { email, password, firstName, lastName, role = 'agent' } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  if (!['admin', 'agent'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const db = req.app.locals.db;

  // Check if email already exists
  db.get(
    'SELECT id FROM users WHERE email = ?',
    [email.toLowerCase()],
    (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }

        db.run(
          'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
          [email.toLowerCase(), hashedPassword, firstName, lastName, role],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Internal server error' });
            }

            db.get(
              'SELECT id, email, firstName, lastName, role, isActive, createdAt FROM users WHERE id = ?',
              [this.lastID],
              (err, newUser) => {
                if (err) {
                  return res.status(500).json({ error: 'Internal server error' });
                }
                res.status(201).json({ 
                  message: 'User created successfully',
                  user: newUser 
                });
              }
            );
          }
        );
      });
    }
  );
});

// Update user (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, role, isActive } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }

  if (role && !['admin', 'agent'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const db = req.app.locals.db;

  db.run(
    'UPDATE users SET firstName = ?, lastName = ?, role = COALESCE(?, role), isActive = COALESCE(?, isActive) WHERE id = ?',
    [firstName, lastName, role, isActive, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      db.get(
        'SELECT id, email, firstName, lastName, role, isActive, createdAt FROM users WHERE id = ?',
        [id],
        (err, updatedUser) => {
          if (err) {
            return res.status(500).json({ error: 'Internal server error' });
          }
          res.json({ 
            message: 'User updated successfully',
            user: updatedUser 
          });
        }
      );
    }
  );
});

// Reset user password (admin only)
router.put('/users/:id/reset-password', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const db = req.app.locals.db;

  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Password reset successfully' });
      }
    );
  });
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const db = req.app.locals.db;

  db.run(
    'DELETE FROM users WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    }
  );
});

// Logout endpoint (optional - mainly for token blacklisting in production)
router.post('/logout', authenticateToken, (req, res) => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just return a success message
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;