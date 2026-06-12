/*
  routes/products.js
*/
const express = require('express');
const router  = express.Router();
const db      = require('../db/database');
const { validateRequired, validatePrice } = require('../utils/validate');

// READ ALL
router.get('/', (req, res) => {
  const products = req.query.category
    ? db.prepare('SELECT * FROM products WHERE LOWER(category) = ? ORDER BY id ASC').all(req.query.category.toLowerCase())
    : db.prepare('SELECT * FROM products ORDER BY id ASC').all();
  res.status(200).json({ success: true, count: products.length, data: products });
});

// READ ONE
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.status(200).json({ success: true, data: product });
});

// CREATE
router.post('/', (req, res) => {
  const { name, category, price, stock } = req.body;
  const missing = validateRequired(['name', 'category', 'price', 'stock'], req.body);
  if (missing.length > 0)
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
  if (!validatePrice(price))
    return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
  if (Number(stock) < 0 || isNaN(Number(stock)))
    return res.status(400).json({ success: false, message: 'Stock must be a non-negative integer' });

  const result = db.prepare('INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)')
                   .run(name.trim(), category.trim().toLowerCase(), Number(price), Math.floor(Number(stock)));
  const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, message: 'Product created', data: newProduct });
});

// UPDATE
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

  const { name, category, price, stock } = req.body;
  const newName     = name     !== undefined ? name.trim()                   : existing.name;
  const newCategory = category !== undefined ? category.trim().toLowerCase() : existing.category;
  const newPrice    = price    !== undefined ? Number(price)                 : existing.price;
  const newStock    = stock    !== undefined ? Math.floor(Number(stock))     : existing.stock;

  if (price !== undefined && !validatePrice(newPrice))
    return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
  if (stock !== undefined && (newStock < 0 || isNaN(newStock)))
    return res.status(400).json({ success: false, message: 'Stock must be a non-negative integer' });

  db.prepare('UPDATE products SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?')
    .run(newName, newCategory, newPrice, newStock, req.params.id);
  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.status(200).json({ success: true, message: 'Product updated', data: updated });
});

// DELETE
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.status(200).json({ success: true, message: 'Product deleted' });
});

module.exports = router;
