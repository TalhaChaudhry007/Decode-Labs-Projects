/*
  index.js 
*/
const express = require('express');
const cors    = require('cors');
const { initDb, getDb } = require('./db/database');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root info
app.get('/', (req, res) => {
  res.status(200).json({
    message:  'DecodeLabs Backend API – Project 3: Database Integration',
    version:  '3.0.0',
    database: 'SQLite (sql.js)',
    endpoints: {
      users:    { base: '/api/users',    methods: 'GET, POST, PUT, DELETE' },
      products: { base: '/api/products', methods: 'GET, POST, PUT, DELETE' },
      contact:  { base: '/api/contact',  methods: 'GET, POST, DELETE'      },
      schema:   { base: '/api/schema',   methods: 'GET'                    },
    },
  });
});

// Schema inspector endpoint
app.get('/api/schema', (req, res) => {
  const rawDb = getDb();
  const result = rawDb.exec("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name");
  const schema = result.length ? result[0].values.map(([name, sql]) => ({ name, sql })) : [];
  res.status(200).json({ success: true, schema });
});

// Error 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Boot
(async () => {
  await initDb();

  // Mounting routes after DB
  const userRoutes    = require('./routes/users');
  const productRoutes = require('./routes/products');
  const contactRoutes = require('./routes/contact');

  app.use('/api/users',    userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/contact',  contactRoutes);

  app.listen(PORT, () => {
    console.log(`\n  Server running at http://localhost:${PORT}`);
    console.log(`  Database: SQLite  →  decodelabs.db`);
    console.log(`  Endpoints:`);
    console.log(`    http://localhost:${PORT}/api/users`);
    console.log(`    http://localhost:${PORT}/api/products`);
    console.log(`    http://localhost:${PORT}/api/contact`);
    console.log(`    http://localhost:${PORT}/api/schema\n`);
  });
})();
