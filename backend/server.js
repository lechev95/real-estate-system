// backend/server.js - COMPLETE SERVER WITH ALL ROUTES
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Environment variables
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://real-estate-crm-frontend.onrender.com';

console.log('🚀 Starting Real Estate CRM API Server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🌐 Frontend URL:', FRONTEND_URL);
console.log('🔌 Port:', PORT);

// Middleware
app.use(cors({
  origin: [
    FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://real-estate-crm-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📋 Request Body:', req.body);
  }
  next();
});

// Import routes
let propertiesRoutes, buyersRoutes, sellersRoutes, tasksRoutes, searchRoutes, analyticsRoutes, authRoutes;

try {
  propertiesRoutes = require('./routes/properties');
  console.log('✅ Properties routes loaded');
} catch (error) {
  console.log('❌ Properties routes not found:', error.message);
}

try {
  buyersRoutes = require('./routes/buyers');
  console.log('✅ Buyers routes loaded');
} catch (error) {
  console.log('❌ Buyers routes not found:', error.message);
}

try {
  sellersRoutes = require('./routes/sellers');
  console.log('✅ Sellers routes loaded');
} catch (error) {
  console.log('❌ Sellers routes not found:', error.message);
}

try {
  tasksRoutes = require('./routes/tasks');
  console.log('✅ Tasks routes loaded');
} catch (error) {
  console.log('❌ Tasks routes not found:', error.message);
}

try {
  searchRoutes = require('./routes/search');
  console.log('✅ Search routes loaded');
} catch (error) {
  console.log('❌ Search routes not found:', error.message);
}

try {
  analyticsRoutes = require('./routes/analytics');
  console.log('✅ Analytics routes loaded');
} catch (error) {
  console.log('❌ Analytics routes not found:', error.message);
}

try {
  authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('❌ Auth routes not found:', error.message);
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      routes: {
        properties: !!propertiesRoutes,
        buyers: !!buyersRoutes,
        sellers: !!sellersRoutes,
        tasks: !!tasksRoutes,
        search: !!searchRoutes,
        analytics: !!analyticsRoutes,
        auth: !!authRoutes
      }
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    });
  }
});

// API Routes - Mount all available routes
if (propertiesRoutes) {
  app.use('/api/properties', propertiesRoutes);
  console.log('🏠 Properties routes mounted at /api/properties');
}

if (buyersRoutes) {
  app.use('/api/buyers', buyersRoutes);
  console.log('👥 Buyers routes mounted at /api/buyers');
}

if (sellersRoutes) {
  app.use('/api/sellers', sellersRoutes);
  console.log('🏪 Sellers routes mounted at /api/sellers');
}

if (tasksRoutes) {
  app.use('/api/tasks', tasksRoutes);
  console.log('📅 Tasks routes mounted at /api/tasks');
}

if (searchRoutes) {
  app.use('/api/search', searchRoutes);
  console.log('🔍 Search routes mounted at /api/search');
}

if (analyticsRoutes) {
  app.use('/api/analytics', analyticsRoutes);
  console.log('📊 Analytics routes mounted at /api/analytics');
}

if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('🔐 Auth routes mounted at /api/auth');
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Real Estate CRM API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      properties: '/api/properties',
      buyers: '/api/buyers',
      sellers: '/api/sellers',
      tasks: '/api/tasks',
      search: '/api/search',
      analytics: '/api/analytics',
      auth: '/api/auth'
    },
    documentation: 'Available endpoints listed above'
  });
});

// List all available routes (for debugging)
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Direct routes
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const basePath = middleware.regexp.source
            .replace('\\', '')
            .replace('(?=\\/|$)', '')
            .replace('^', '')
            .replace('$', '');
          
          routes.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: basePath + handler.route.path
          });
        }
      });
    }
  });
  
  res.json({
    message: 'Available API routes',
    count: routes.length,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path))
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Database Error',
      details: err.message
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 - Route not found
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: {
      health: 'GET /health',
      root: 'GET /',
      routes: 'GET /api/routes',
      properties: 'GET|POST|PUT|DELETE /api/properties',
      buyers: 'GET|POST|PUT|DELETE /api/buyers',
      sellers: 'GET|POST|PUT|DELETE /api/sellers',
      tasks: 'GET|POST|PUT|DELETE /api/tasks',
      search: 'GET /api/search/*',
      analytics: 'GET /api/analytics/*'
    },
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🎉 Real Estate CRM API Server is running!`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 API Routes: http://localhost:${PORT}/api/routes`);
  console.log(`🔗 CORS enabled for: ${FRONTEND_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;