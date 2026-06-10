const express = require('express');
const router = express.Router();
const { validateRequired, validateEmail, validateStringLength } = require('../utils/validate');

let messages = [];
let nextId = 1;

router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;
  const missing = validateRequired(['name', 'email', 'subject', 'message'], req.body);
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing fields: ${missing.join(', ')}`
    });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }
  if (!validateStringLength(message, 10, 1000)) {
    return res.status(400).json({
      success: false,
      message: 'Message must be between 10 and 1000 characters'
    });
  }
  const entry = {
    id: nextId++,
    name: name.trim(),
    email: email.toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    submittedAt: new Date().toISOString(),
  };
  messages.push(entry);
  res.status(201).json({ success: true, message: 'Message received', data: entry });
});

router.get('/', (req, res) => {
  res.status(200).json({ success: true, count: messages.length, data: messages });
});

module.exports = router;