const express = require('express');
const cors = require('cors');
const userRoutes    = require('./routes/users');
const productRoutes = require('./routes/products');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact',  contactRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'DecodeLabs Backend API is running',
    version: '1.0.0',
    endpoints: {
      users:    '/api/users',
      products: '/api/products',
      contact:  '/api/contact',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});