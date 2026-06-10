const express = require('express');
const router = express.Router();
const { validateRequired, validatePrice } = require('../utils/validate');

let products = [
  { id: 1, name: 'Laptop', category: 'electronics', price: 75000, stock: 10 },
  { id: 2, name: 'Notebook', category: 'stationery', price: 120, stock: 50 },
];
let nextId = 3;

router.get('/', (req, res) => {
  let result = [...products];
  if (req.query.category) {
    result = result.filter((p) => p.category === req.query.category.toLowerCase());
  }
  res.status(200).json({ success: true, count: result.length, data: result });
});

router.get('/:id', (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.status(200).json({ success: true, data: product });
});

router.post('/', (req, res) => {
  const { name, category, price, stock } = req.body;
  const missing = validateRequired(['name', 'category', 'price', 'stock'], req.body);
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing fields: ${missing.join(', ')}`
    });
  }
  if (!validatePrice(price)) {
    return res.status(400).json({ success: false, message: 'Price must be a positive number' });
  }
  const newProduct = { 
    id: nextId++,
    name: name.trim(),
    category: category.trim().toLowerCase(),
    price: Number(price),
    stock: Number(stock),
  };
  products.push(newProduct);
  res.status(201).json({ success: true, message: 'Product created', data: newProduct });
});

router.delete('/:id', (req, res) => {
  const index = products.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  products.splice(index, 1);
  res.status(204).send();
});

module.exports = router;