/*
  routes/users.js 
*/
const express = require('express');
const router  = express.Router();
const db      = require('../db/database');
const { validateRequired, validateEmail, validateAge } = require('../utils/validate');

// READ ALL
router.get('/', (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY id ASC').all();
  res.status(200).json({ success: true, count: users.length, data: users });
});

// READ ONE
router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, data: user });
});

// CREATE 
router.post('/', (req, res) => {
  const { name, email, age } = req.body;
  const missing = validateRequired(['name', 'email', 'age'], req.body);
  if (missing.length > 0)
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
  if (!validateEmail(email))
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  if (!validateAge(age))
    return res.status(400).json({ success: false, message: 'Age must be between 1 and 120' });

  try {
    const result = db.prepare('INSERT INTO users (name, email, age) VALUES (?, ?, ?)')
                     .run(name.trim(), email.toLowerCase().trim(), Number(age));
    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: 'User created', data: newUser });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE'))
      return res.status(409).json({ success: false, message: 'Email already exists' });
    throw err;
  }
});

// UPDATE 
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

  const { name, email, age } = req.body;
  const newName  = name  !== undefined ? name.trim()                : existing.name;
  const newEmail = email !== undefined ? email.toLowerCase().trim() : existing.email;
  const newAge   = age   !== undefined ? Number(age)                : existing.age;

  if (email !== undefined && !validateEmail(newEmail))
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  if (age !== undefined && !validateAge(newAge))
    return res.status(400).json({ success: false, message: 'Age must be between 1 and 120' });

  try {
    db.prepare('UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?')
      .run(newName, newEmail, newAge, req.params.id);
    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    res.status(200).json({ success: true, message: 'User updated', data: updated });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE'))
      return res.status(409).json({ success: false, message: 'Email already exists' });
    throw err;
  }
});

// DELETE 
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'User not found' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.status(200).json({ success: true, message: 'User deleted' });
});

module.exports = router;
