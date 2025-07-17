// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://real-estate-crm-frontend.onrender.com',
    /\.vercel\.app$/,
    /\.netlify\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Enhanced middleware with better error handling
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields if any
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    console.log(`Request body:`, sanitizedBody);
  }
  
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint with detailed status
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    routes: {
      properties: '/api/properties',
      buyers: '/api/buyers',
      sellers: '/api/sellers',
      tasks: '/api/tasks',
      analytics: '/api/analytics',
      search: '/api/search',
      auth: '/api/auth'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };
  
  console.log('✅ Health check passed');
  res.json(healthStatus);
});

// API Routes with error handling wrappers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Import and mount routes with comprehensive error handling
try {
  // Properties routes
  const propertiesRoutes = require('./routes/properties');
  app.use('/api/properties', asyncHandler(async (req, res, next) => {
    propertiesRoutes(req, res, next);
  }));
  console.log('✅ Properties routes loaded');
} catch (error) {
  console.warn('⚠️ Properties routes not available:', error.message);
}

try {
  // Buyers routes
  const buyersRoutes = require('./routes/buyers');
  app.use('/api/buyers', asyncHandler(async (req, res, next) => {
    buyersRoutes(req, res, next);
  }));
  console.log('✅ Buyers routes loaded');
} catch (error) {
  console.warn('⚠️ Buyers routes not available:', error.message);
}

try {
  // Sellers routes
  const sellersRoutes = require('./routes/sellers');
  app.use('/api/sellers', asyncHandler(async (req, res, next) => {
    sellersRoutes(req, res, next);
  }));
  console.log('✅ Sellers routes loaded');
} catch (error) {
  console.warn('⚠️ Sellers routes not available:', error.message);
}

try {
  // Tasks routes
  const tasksRoutes = require('./routes/tasks');
  app.use('/api/tasks', asyncHandler(async (req, res, next) => {
    tasksRoutes(req, res, next);
  }));
  console.log('✅ Tasks routes loaded');
} catch (error) {
  console.warn('⚠️ Tasks routes not available:', error.message);
}

try {
  // Analytics routes
  const analyticsRoutes = require('./routes/analytics');
  app.use('/api/analytics', asyncHandler(async (req, res, next) => {
    analyticsRoutes(req, res, next);
  }));
  console.log('✅ Analytics routes loaded');
} catch (error) {
  console.warn('⚠️ Analytics routes not available:', error.message);
}

try {
  // Search routes
  const searchRoutes = require('./routes/search');
  app.use('/api/search', asyncHandler(async (req, res, next) => {
    searchRoutes(req, res, next);
  }));
  console.log('✅ Search routes loaded');
} catch (error) {
  console.warn('⚠️ Search routes not available:', error.message);
}

try {
  // Auth routes
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', asyncHandler(async (req, res, next) => {
    authRoutes(req, res, next);
  }));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.warn('⚠️ Auth routes not available:', error.message);
}

// API routes listing endpoint
app.get('/api/routes', (req, res) => {
  res.json({
    message: 'Available API routes',
    routes: [
      {
        path: '/api/properties',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Property management endpoints'
      },
      {
        path: '/api/buyers',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Buyer management endpoints'
      },
      {
        path: '/api/sellers',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Seller management endpoints'
      },
      {
        path: '/api/tasks',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'Task management endpoints'
      },
      {
        path: '/api/analytics',
        methods: ['GET'],
        description: 'Analytics and reporting endpoints'
      },
      {
        path: '/api/search',
        methods: ['GET', 'POST'],
        description: 'Search and filtering endpoints'
      },
      {
        path: '/api/auth',
        methods: ['GET', 'POST', 'PUT'],
        description: 'Authentication endpoints'
      }
    ],
    health: '/health',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Real Estate CRM API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      routes: '/api/routes',
      properties: '/api/properties',
      buyers: '/api/buyers',
      sellers: '/api/sellers',
      tasks: '/api/tasks',
      analytics: '/api/analytics',
      search: '/api/search',
      auth: '/api/auth'
    },
    documentation: 'Visit /api/routes for detailed endpoint information'
  });
});

// Catch-all for API routes that don't exist
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableRoutes: '/api/routes',
    requestedPath: req.path,
    method: req.method
  });
});

// Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(buildPath));
  
  // Handle React routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  
  console.log('📦 Serving static files from:', buildPath);
}

// JSON parsing error handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('❌ JSON parsing error:', error.message);
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format',
      message: 'Please check your request body format',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  next(error);
});

// Enhanced error handling middleware
app.use((error, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`${timestamp} - Error in ${req.method} ${req.path}:`, error);
  
  // Default error status
  let status = error.status || error.statusCode || 500;
  let message = error.message || 'Internal server error';
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid data format';
  } else if (error.code === 'ECONNREFUSED') {
    status = 503;
    message = 'Service temporarily unavailable';
  } else if (error.code === 'ENOTFOUND') {
    status = 502;
    message = 'External service not found';
  }
  
  // Don't expose internal errors in production
  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }
  
  const errorResponse = {
    success: false,
    error: message,
    timestamp,
    path: req.path,
    method: req.method,
    status
  };
  
  // Include stack trace and details only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = error.message;
    errorResponse.stack = error.stack;
  }
  
  res.status(status).json(errorResponse);
});

// 404 handler for non-API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The route ${req.method} ${req.path} does not exist`,
    availableEndpoints: {
      api: '/api/routes',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Real Estate CRM API Server Started');
  console.log('📍 Server Details:');
  console.log(`   ✅ Port: ${PORT}`);
  console.log(`   ✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ✅ Health check: http://localhost:${PORT}/health`);
  console.log(`   ✅ API routes: http://localhost:${PORT}/api/routes`);
  console.log(`   ✅ Base URL: http://localhost:${PORT}`);
  console.log('📱 Ready to accept requests!');
});

module.exports = app;