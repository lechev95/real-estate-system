// // backend/server.js - Complete with Authentication
// const express = require('express');
// const cors = require('cors');
// const sqlite3 = require('sqlite3').verbose();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const app = express();
// const PORT = process.env.PORT || 5000;
// const JWT_SECRET = process.env.JWT_SECRET || 'myucons_secret_key_2025';

// // Middleware
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://real-estate-crm-frontend.onrender.com'],
//   credentials: true
// }));
// app.use(express.json());

// // Database initialization
// const db = new sqlite3.Database(':memory:');

// // Initialize database tables
// db.serialize(() => {
//   // Users table
//   db.run(`CREATE TABLE users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     email TEXT UNIQUE NOT NULL,
//     password TEXT NOT NULL,
//     firstName TEXT NOT NULL,
//     lastName TEXT NOT NULL,
//     role TEXT DEFAULT 'agent',
//     isActive BOOLEAN DEFAULT 1,
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
//   )`);

//   // Properties table
//   db.run(`CREATE TABLE properties (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL,
//     description TEXT,
//     price DECIMAL(12,2),
//     location TEXT,
//     type TEXT,
//     bedrooms INTEGER,
//     bathrooms INTEGER,
//     area DECIMAL(10,2),
//     status TEXT DEFAULT 'available',
//     isArchived BOOLEAN DEFAULT 0,
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
//   )`);

//   // Buyers table
//   db.run(`CREATE TABLE buyers (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     firstName TEXT NOT NULL,
//     lastName TEXT NOT NULL,
//     email TEXT,
//     phone TEXT,
//     budget DECIMAL(12,2),
//     preferredLocation TEXT,
//     notes TEXT,
//     isArchived BOOLEAN DEFAULT 0,
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
//   )`);

//   // Sellers table
//   db.run(`CREATE TABLE sellers (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     firstName TEXT NOT NULL,
//     lastName TEXT NOT NULL,
//     email TEXT,
//     phone TEXT,
//     propertyAddress TEXT,
//     askingPrice DECIMAL(12,2),
//     commission DECIMAL(5,2),
//     notes TEXT,
//     isArchived BOOLEAN DEFAULT 0,
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
//   )`);

//   // Tasks table
//   db.run(`CREATE TABLE tasks (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL,
//     description TEXT,
//     dueDate DATE,
//     priority TEXT DEFAULT 'medium',
//     status TEXT DEFAULT 'pending',
//     assignedTo TEXT,
//     relatedType TEXT,
//     relatedId INTEGER,
//     completedAt DATETIME,
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//     updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
//   )`);

//   // Create default admin user
//   const adminPassword = bcrypt.hashSync('admin123', 10);
//   const agentPassword = bcrypt.hashSync('agent123', 10);
  
//   db.run(`INSERT INTO users (email, password, firstName, lastName, role) VALUES 
//     ('admin@myucons.bg', ?, 'Админ', 'Потребител', 'admin'),
//     ('agent@myucons.bg', ?, 'Агент', 'Потребител', 'agent')`,
//     [adminPassword, agentPassword]
//   );

//   // Sample data
//   db.run(`INSERT INTO properties (title, description, price, location, type, bedrooms, bathrooms, area) VALUES 
//     ('Луксозен апартамент в Лозенец', 'Просторен 3-стаен апартамент с гледка към парка', 450000, 'Лозенец, София', 'Апартамент', 3, 2, 120.5),
//     ('Семейна къща в Бояна', 'Двуетажна къща с двор и гараж', 680000, 'Бояна, София', 'Къща', 4, 3, 200.0),
//     ('Офис в центъра', 'Представителен офис в бизнес сграда', 320000, 'Център, София', 'Офис', 0, 1, 85.0)`);

//   db.run(`INSERT INTO buyers (firstName, lastName, email, phone, budget, preferredLocation) VALUES 
//     ('Иван', 'Петров', 'ivan.petrov@email.com', '+359888123456', 400000, 'Лозенец'),
//     ('Мария', 'Георгиева', 'maria.georgieva@email.com', '+359888654321', 500000, 'Витоша'),
//     ('Петър', 'Димитров', 'petar.dimitrov@email.com', '+359888987654', 300000, 'Студентски град')`);

//   db.run(`INSERT INTO sellers (firstName, lastName, email, phone, propertyAddress, askingPrice, commission) VALUES 
//     ('Анна', 'Стоянова', 'anna.stoyanova@email.com', '+359888111222', 'ул. Витоша 100', 480000, 3.0),
//     ('Димитър', 'Николов', 'dimitar.nikolov@email.com', '+359888333444', 'бул. Васил Левски 45', 350000, 2.5),
//     ('Елена', 'Василева', 'elena.vasileva@email.com', '+359888555666', 'кв. Дружба 2', 280000, 2.0)`);

//   db.run(`INSERT INTO tasks (title, description, dueDate, priority, assignedTo, relatedType, relatedId) VALUES 
//     ('Оглед на имот в Лозенец', 'Организиране на оглед с клиент Иван Петров', '2025-07-20', 'high', 'Агент Потребител', 'property', 1),
//     ('Подготовка на документи', 'Подготовка на документи за продажба', '2025-07-22', 'medium', 'Агент Потребител', 'seller', 1),
//     ('Следващ контакт с купувач', 'Проследяване на интереса на Мария Георгиева', '2025-07-25', 'low', 'Агент Потребител', 'buyer', 2)`);
// });

// // Authentication middleware
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ error: 'Access token required' });
//   }

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ error: 'Invalid or expired token' });
//     }
//     req.user = user;
//     next();
//   });
// };

// // Admin only middleware
// const requireAdmin = (req, res, next) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Admin access required' });
//   }
//   next();
// };

// // Import auth routes
// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);

// // Properties endpoints
// app.get('/api/properties', authenticateToken, (req, res) => {
//   db.all('SELECT * FROM properties ORDER BY createdAt DESC', (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({ properties: rows });
//   });
// });

// app.post('/api/properties', authenticateToken, (req, res) => {
//   const { title, description, price, location, type, bedrooms, bathrooms, area } = req.body;
  
//   db.run(
//     `INSERT INTO properties (title, description, price, location, type, bedrooms, bathrooms, area) 
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//     [title, description, price, location, type, bedrooms, bathrooms, area],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
      
//       db.get('SELECT * FROM properties WHERE id = ?', [this.lastID], (err, row) => {
//         if (err) {
//           res.status(500).json({ error: err.message });
//           return;
//         }
//         res.status(201).json({ property: row });
//       });
//     }
//   );
// });

// app.put('/api/properties/:id', authenticateToken, (req, res) => {
//   const { title, description, price, location, type, bedrooms, bathrooms, area } = req.body;
//   const { id } = req.params;
  
//   db.run(
//     `UPDATE properties SET 
//      title = ?, description = ?, price = ?, location = ?, type = ?, 
//      bedrooms = ?, bathrooms = ?, area = ?, updatedAt = CURRENT_TIMESTAMP 
//      WHERE id = ?`,
//     [title, description, price, location, type, bedrooms, bathrooms, area, id],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
      
//       db.get('SELECT * FROM properties WHERE id = ?', [id], (err, row) => {
//         if (err) {
//           res.status(500).json({ error: err.message });
//           return;
//         }
//         res.json({ property: row });
//       });
//     }
//   );
// });

// app.put('/api/properties/:id/archive', authenticateToken, (req, res) => {
//   const { id } = req.params;
  
//   db.run(
//     'UPDATE properties SET isArchived = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
//     [id],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
//       res.json({ message: 'Property archived successfully' });
//     }
//   );
// });

// app.delete('/api/properties/:id', authenticateToken, (req, res) => {
//   const { id } = req.params;
  
//   db.run('DELETE FROM properties WHERE id = ?', [id], function(err) {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({ message: 'Property deleted successfully' });
//   });
// });

// // Buyers endpoints
// app.get('/api/buyers', authenticateToken, (req, res) => {
//   db.all('SELECT * FROM buyers ORDER BY createdAt DESC', (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({ buyers: rows });
//   });
// });

// app.post('/api/buyers', authenticateToken, (req, res) => {
//   const { firstName, lastName, email, phone, budget, preferredLocation, notes } = req.body;
  
//   db.run(
//     `INSERT INTO buyers (firstName, lastName, email, phone, budget, preferredLocation, notes) 
//      VALUES (?, ?, ?, ?, ?, ?, ?)`,
//     [firstName, lastName, email, phone, budget, preferredLocation, notes],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
      
//       db.get('SELECT * FROM buyers WHERE id = ?', [this.lastID], (err, row) => {
//         if (err) {
//           res.status(500).json({ error: err.message });
//           return;
//         }
//         res.status(201).json({ buyer: row });
//       });
//     }
//   );
// });

// app.put('/api/buyers/:id', authenticateToken, (req, res) => {
//   const { firstName, lastName, email, phone, budget, preferredLocation, notes } = req.body;
//   const { id } = req.params;
  
//   db.run(
//     `UPDATE buyers SET 
//      firstName = ?, lastName = ?, email = ?, phone = ?, budget = ?, 
//      preferredLocation = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP 
//      WHERE id = ?`,
//     [firstName, lastName, email, phone, budget, preferredLocation, notes, id],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
      
//       db.get('SELECT * FROM buyers WHERE id = ?', [id], (err, row) => {
//         if (err) {
//           res.status(500).json({ error: err.message });
//           return;
//         }
//         res.json({ buyer: row });
//       });
//     }
//   );
// });

// app.put('/api/buyers/:id/archive', authenticateToken, (req, res) => {
//   const { id } = req.params;
  
//   db.run(
//     'UPDATE buyers SET isArchived = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
//     [id],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
//       res.json({ message: 'Buyer archived successfully' });
//     }
//   );
// });

// app.delete('/api/buyers/:id', authenticateToken, (req, res) => {
//   const { id } = req.params;
  
//   db.run('DELETE FROM buyers WHERE id = ?', [id], function(err) {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({ message: 'Buyer deleted successfully' });
//   });
// });

// // Sellers endpoints
// app.get('/api/sellers', authenticateToken, (req, res) => {
//   db.all('SELECT * FROM sellers ORDER BY createdAt DESC', (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({ sellers: rows });
//   });
// });

// app.post('/api/sellers', authenticateToken, (req, res) => {
//   const { firstName, lastName, email, phone, propertyAddress, askingPrice, commission, notes } = req.body;
  
//   db.run(
//     `INSERT INTO sellers (firstName, lastName, email, phone, propertyAddress, askingPrice, commission, notes) 
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//     [firstName, lastName, email, phone, propertyAddress, askingPrice, commission, notes],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
      
//       db.get('SELECT * FROM sellers WHERE id = ?', [this.lastID], (err, row) => {
//         if (err) {
//           res.status(500).json({ error: err.message });
//           return;
//         }
//         res.status(201).json({ seller: row });
//       });
//     }
//   );
// });

// app.put('/api/sellers/:id', authenticateToken, (req, res) => {
//   const { firstName, lastName, email, phone, propertyAddress, askingPrice, commission, notes } = req.body;
//   const { id } = req.params;
  
//   db.run(
//     `UPDATE sellers SET 
//      firstName = ?, lastName = ?, email = ?, phone = ?, propertyAddress = ?, 
//      askingPrice = ?, commission = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP 
//      WHERE id = ?`,
//     [firstName, lastName, email, phone, propertyAddress, askingPrice, commission, notes, id],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
      
//       db.get('SELECT * FROM sellers WHERE id = ?', [id], (err, row) => {
//         if (err) {
//           res.status(500).json({ error: err.message });
//           return;
//         }
//         res.json({ seller: row });
//       });
//     }
//   );
// });

// app.put('/api/sellers/:id/archive', authenticateToken, (req, res) => {
//   const { id } = req.params;
  
//   db.run(
//     'UPDATE sellers SET isArchived = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
//     [id],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
//       res.json({ message: 'Seller archived successfully' });
//     }
//   );
// });

// app.delete('/api/sellers/:id', authenticateToken, (req, res) => {
//   const { id } = req.params;
  
//   db.run('DELETE FROM sellers WHERE id = ?', [id], function(err) {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({ message: 'Seller deleted successfully' });
//   });
// });

// // Tasks endpoints
// app.get('/api/tasks', authenticateToken, (req, res) => {
//   db.all('SELECT * FROM tasks ORDER BY dueDate ASC, createdAt DESC', (err, rows) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({ tasks: rows });
//   });
// });

// app.post('/api/tasks', authenticateToken, (req, res) => {
//   const { title, description, dueDate, priority, assignedTo, relatedType, relatedId } = req.body;
  
//   db.run(
//     `INSERT INTO tasks (title, description, dueDate, priority, assignedTo, relatedType, relatedId) 
//      VALUES (?, ?, ?, ?, ?, ?, ?)`,
//     [title, description, dueDate, priority, assignedTo, relatedType, relatedId],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
      
//       db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
//         if (err) {
//           res.status(500).json({ error: err.message });
//           return;
//         }
//         res.status(201).json({ task: row });
//       });
//     }
//   );
// });

// app.put('/api/tasks/:id', authenticateToken, (req, res) => {
//   const { title, description, dueDate, priority, assignedTo, relatedType, relatedId } = req.body;
//   const { id } = req.params;
  
//   db.run(
//     `UPDATE tasks SET 
//      title = ?, description = ?, dueDate = ?, priority = ?, assignedTo = ?, 
//      relatedType = ?, relatedId = ?, updatedAt = CURRENT_TIMESTAMP 
//      WHERE id = ?`,
//     [title, description, dueDate, priority, assignedTo, relatedType, relatedId, id],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
      
//       db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
//         if (err) {
//           res.status(500).json({ error: err.message });
//           return;
//         }
//         res.json({ task: row });
//       });
//     }
//   );
// });

// app.put('/api/tasks/:id/complete', authenticateToken, (req, res) => {
//   const { id } = req.params;
  
//   db.run(
//     'UPDATE tasks SET status = "completed", completedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
//     [id],
//     function(err) {
//       if (err) {
//         res.status(500).json({ error: err.message });
//         return;
//       }
//       res.json({ message: 'Task completed successfully' });
//     }
//   );
// });

// app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
//   const { id } = req.params;
  
//   db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json({ message: 'Task deleted successfully' });
//   });
// });

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'М&Ю Консулт CRM API is running' });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`М&Ю Консулт CRM API running on port ${PORT}`);
// });

// backend/server.js - Fixed with proper database sharing
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'myucons_secret_key_2025';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://real-estate-crm-frontend.onrender.com'],
  credentials: true
}));
app.use(express.json());

// Create database instance 
const db = new sqlite3.Database(':memory:'); // Use :memory: for now

// IMPORTANT: Share database with all routes
app.locals.db = db;

// Initialize database and create tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table first
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        role TEXT DEFAULT 'agent',
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Error creating users table:', err);
          return reject(err);
        }
        console.log('✅ Users table created');
      });

      // Create other tables
      db.run(`CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price DECIMAL(12,2),
        location TEXT,
        type TEXT,
        bedrooms INTEGER,
        bathrooms INTEGER,
        area DECIMAL(10,2),
        status TEXT DEFAULT 'available',
        isArchived BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS buyers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        budget DECIMAL(12,2),
        preferredLocation TEXT,
        notes TEXT,
        isArchived BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS sellers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        propertyAddress TEXT,
        askingPrice DECIMAL(12,2),
        commission DECIMAL(5,2),
        notes TEXT,
        isArchived BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        dueDate DATE,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        assignedTo TEXT,
        relatedType TEXT,
        relatedId INTEGER,
        completedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create default users with hashed passwords
      const adminPassword = bcrypt.hashSync('admin123', 10);
      const agentPassword = bcrypt.hashSync('agent123', 10);
      
      // Insert default users
      db.run(`INSERT OR IGNORE INTO users (email, password, firstName, lastName, role) VALUES 
        ('admin@myucons.bg', ?, 'Админ', 'Потребител', 'admin'),
        ('agent@myucons.bg', ?, 'Агент', 'Потребител', 'agent')`,
        [adminPassword, agentPassword], function(err) {
          if (err) {
            console.error('❌ Error creating default users:', err);
            return reject(err);
          }
          console.log('✅ Default users created');
          
          // Insert sample data
          insertSampleData().then(() => {
            console.log('✅ Database initialization complete');
            resolve();
          }).catch(reject);
        }
      );
    });
  });
};

const insertSampleData = () => {
  return new Promise((resolve) => {
    // Sample properties
    db.run(`INSERT OR IGNORE INTO properties (title, description, price, location, type, bedrooms, bathrooms, area) VALUES 
      ('Луксозен апартамент в Лозенец', 'Просторен 3-стаен апартамент с гледка към парка', 450000, 'Лозенец, София', 'Апартамент', 3, 2, 120.5),
      ('Семейна къща в Бояна', 'Двуетажна къща с двор и гараж', 680000, 'Бояна, София', 'Къща', 4, 3, 200.0),
      ('Офис в центъра', 'Представителен офис в бизнес сграда', 320000, 'Център, София', 'Офис', 0, 1, 85.0)`);

    // Sample buyers
    db.run(`INSERT OR IGNORE INTO buyers (firstName, lastName, email, phone, budget, preferredLocation) VALUES 
      ('Иван', 'Петров', 'ivan.petrov@email.com', '+359888123456', 400000, 'Лозенец'),
      ('Мария', 'Георгиева', 'maria.georgieva@email.com', '+359888654321', 500000, 'Витоша'),
      ('Петър', 'Димитров', 'petar.dimitrov@email.com', '+359888987654', 300000, 'Студентски град')`);

    // Sample sellers  
    db.run(`INSERT OR IGNORE INTO sellers (firstName, lastName, email, phone, propertyAddress, askingPrice, commission) VALUES 
      ('Анна', 'Стоянова', 'anna.stoyanova@email.com', '+359888111222', 'ул. Витоша 100', 480000, 3.0),
      ('Димитър', 'Николов', 'dimitar.nikolov@email.com', '+359888333444', 'бул. Васил Левски 45', 350000, 2.5),
      ('Елена', 'Василева', 'elena.vasileva@email.com', '+359888555666', 'кв. Дружба 2', 280000, 2.0)`);

    // Sample tasks
    db.run(`INSERT OR IGNORE INTO tasks (title, description, dueDate, priority, assignedTo, relatedType, relatedId) VALUES 
      ('Оглед на имот в Лозенец', 'Организиране на оглед с клиент Иван Петров', '2025-07-25', 'high', 'Агент Потребител', 'property', 1),
      ('Подготовка на документи', 'Подготовка на документи за продажба', '2025-07-28', 'medium', 'Агент Потребител', 'seller', 1),
      ('Следващ контакт с купувач', 'Проследяване на интереса на Мария Георгиева', '2025-07-30', 'low', 'Агент Потребител', 'buyer', 2)`, () => {
      console.log('✅ Sample data inserted');
      resolve();
    });
  });
};

// Authentication middleware
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

// Initialize database BEFORE setting up routes
initializeDatabase().then(() => {
  console.log('🎯 Database ready, setting up routes...');
  
  // NOW import and use auth routes - AFTER database is ready
  try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
  } catch (err) {
    console.error('❌ Error loading auth routes:', err);
  }

  // Properties endpoints
  app.get('/api/properties', authenticateToken, (req, res) => {
    db.all('SELECT * FROM properties WHERE isArchived = 0 ORDER BY createdAt DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ properties: rows });
    });
  });

  app.post('/api/properties', authenticateToken, (req, res) => {
    const { title, description, price, location, type, bedrooms, bathrooms, area } = req.body;
    
    db.run(
      `INSERT INTO properties (title, description, price, location, type, bedrooms, bathrooms, area) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, location, type, bedrooms, bathrooms, area],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        db.get('SELECT * FROM properties WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json({ property: row });
        });
      }
    );
  });

  // Buyers endpoints
  app.get('/api/buyers', authenticateToken, (req, res) => {
    db.all('SELECT * FROM buyers WHERE isArchived = 0 ORDER BY createdAt DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ buyers: rows });
    });
  });

  app.post('/api/buyers', authenticateToken, (req, res) => {
    const { firstName, lastName, email, phone, budget, preferredLocation, notes } = req.body;
    
    db.run(
      `INSERT INTO buyers (firstName, lastName, email, phone, budget, preferredLocation, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone, budget, preferredLocation, notes],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        db.get('SELECT * FROM buyers WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json({ buyer: row });
        });
      }
    );
  });

  // Sellers endpoints  
  app.get('/api/sellers', authenticateToken, (req, res) => {
    db.all('SELECT * FROM sellers WHERE isArchived = 0 ORDER BY createdAt DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ sellers: rows });
    });
  });

  app.post('/api/sellers', authenticateToken, (req, res) => {
    const { firstName, lastName, email, phone, propertyAddress, askingPrice, commission, notes } = req.body;
    
    db.run(
      `INSERT INTO sellers (firstName, lastName, email, phone, propertyAddress, askingPrice, commission, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone, propertyAddress, askingPrice, commission, notes],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        db.get('SELECT * FROM sellers WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json({ seller: row });
        });
      }
    );
  });

  // Tasks endpoints
  app.get('/api/tasks', authenticateToken, (req, res) => {
    db.all('SELECT * FROM tasks ORDER BY dueDate ASC, createdAt DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ tasks: rows });
    });
  });

  app.post('/api/tasks', authenticateToken, (req, res) => {
    const { title, description, dueDate, priority, assignedTo, relatedType, relatedId } = req.body;
    
    db.run(
      `INSERT INTO tasks (title, description, dueDate, priority, assignedTo, relatedType, relatedId) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, dueDate, priority, assignedTo, relatedType, relatedId],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json({ task: row });
        });
      }
    );
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'М&Ю Консулт CRM API is running',
      timestamp: new Date().toISOString()
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 М&Ю Консулт CRM API running on port ${PORT}`);
    console.log(`🔐 Authentication enabled with JWT`);
    console.log(`👑 Demo Admin: admin@myucons.bg / admin123`);
    console.log(`👤 Demo Agent: agent@myucons.bg / agent123`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
  });

}).catch((err) => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});