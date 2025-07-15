// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (important for Render)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://real-estate-crm-frontend.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Real Estate CRM API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
try {
  // Import route modules
  const authRoutes = require('./routes/auth');
  const propertiesRoutes = require('./routes/properties');
  const buyersRoutes = require('./routes/buyers');
  const sellersRoutes = require('./routes/sellers');
  const tasksRoutes = require('./routes/tasks');
  const searchRoutes = require('./routes/search');
  const analyticsRoutes = require('./routes/analytics');

  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertiesRoutes);
  app.use('/api/buyers', buyersRoutes);
  app.use('/api/sellers', sellersRoutes);
  app.use('/api/tasks', tasksRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/analytics', analyticsRoutes);

  console.log('✅ All API routes loaded successfully');

} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error('Make sure all route files exist in the routes/ directory');
}

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Real Estate CRM API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'User authentication',
        'POST /api/auth/register': 'User registration',
        'POST /api/auth/logout': 'User logout'
      },
      properties: {
        'GET /api/properties': 'Get all properties with filters',
        'GET /api/properties/:id': 'Get single property',
        'POST /api/properties': 'Create new property',
        'PUT /api/properties/:id': 'Update property',
        'DELETE /api/properties/:id': 'Delete property',
        'PATCH /api/properties/:id/viewings': 'Increment viewings'
      },
      buyers: {
        'GET /api/buyers': 'Get all buyers with filters',
        'GET /api/buyers/:id': 'Get single buyer',
        'POST /api/buyers': 'Create new buyer',
        'PUT /api/buyers/:id': 'Update buyer',
        'DELETE /api/buyers/:id': 'Delete buyer',
        'PATCH /api/buyers/:id/contact': 'Update last contact',
        'PATCH /api/buyers/:id/status': 'Update buyer status'
      },
      sellers: {
        'GET /api/sellers': 'Get all sellers',
        'GET /api/sellers/:id': 'Get single seller',
        'POST /api/sellers': 'Create new seller',
        'PUT /api/sellers/:id': 'Update seller',
        'DELETE /api/sellers/:id': 'Delete seller'
      },
      tasks: {
        'GET /api/tasks': 'Get all tasks with filters',
        'GET /api/tasks/:id': 'Get single task',
        'GET /api/tasks/overdue': 'Get overdue tasks',
        'POST /api/tasks': 'Create new task',
        'PUT /api/tasks/:id': 'Update task',
        'DELETE /api/tasks/:id': 'Delete task',
        'PATCH /api/tasks/:id/complete': 'Mark task complete',
        'PATCH /api/tasks/:id/status': 'Update task status'
      },
      search: {
        'GET /api/search': 'Universal search',
        'GET /api/search/suggestions': 'Search suggestions',
        'GET /api/search/quick': 'Quick ID-based search'
      },
      analytics: {
        'GET /api/analytics/dashboard': 'Dashboard analytics',
        'GET /api/analytics/kpis': 'KPI metrics',
        'GET /api/analytics/properties': 'Property analytics',
        'GET /api/analytics/performance': 'Agent performance'
      }
    },
    documentation: 'Visit /health for service status'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /health',
      'GET /api',
      'POST /api/auth/login',
      'GET /api/properties',
      'GET /api/buyers',
      'GET /api/sellers',
      'GET /api/tasks',
      'GET /api/search',
      'GET /api/analytics/dashboard'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  
  // Prisma errors
  if (error.code && error.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Database error',
      message: 'Invalid request or data constraint violation'
    });
  }
  
  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: error.message
    });
  }
  
  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Real Estate CRM API running!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🔗 CORS enabled for: ${corsOptions.origin.join(', ')}`);
  console.log('✅ Server started successfully!');
});