/*
  routes/contact.js
*/
const express = require('express');
const router  = express.Router();
const db      = require('../db/database');
const { validateRequired, validateEmail, validateStringLength } = require('../utils/validate');

// CREATE
router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;
  const missing = validateRequired(['name', 'email', 'subject', 'message'], req.body);
  if (missing.length > 0)
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
  if (!validateEmail(email))
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  if (!validateStringLength(message, 10, 1000))
    return res.status(400).json({ success: false, message: 'Message must be between 10 and 1000 characters' });

  const result = db.prepare('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)')
                   .run(name.trim(), email.toLowerCase().trim(), subject.trim(), message.trim());
  const entry = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, message: 'Message received', data: entry });
});

// READ ALL
router.get('/', (req, res) => {
  const messages = db.prepare('SELECT * FROM contacts ORDER BY id DESC').all();
  res.status(200).json({ success: true, count: messages.length, data: messages });
});

// READ ONE
router.get('/:id', (req, res) => {
  const entry = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!entry) return res.status(404).json({ success: false, message: 'Message not found' });
  res.status(200).json({ success: true, data: entry });
});

// DELETE
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM contacts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Message not found' });
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.status(200).json({ success: true, message: 'Message deleted' });
});

module.exports = router;
