const express = require('express');
const router = express.Router();
const { validateRequired, validateEmail, validateAge } = require('../utils/validate');

let users = [
  { id: 1, name: 'Ali Hassan', email: 'ali@example.com', age: 24 },
  { id: 2, name: 'Sara Khan', email: 'sara@example.com', age: 22 },
];
let nextId = 3;

router.get('/', (req, res) => {
  res.status(200).json({ success: true, count: users.length, data: users });
});

router.get('/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, data: user });
});

router.post('/', (req, res) => {
  const { name, email, age } = req.body;
  const missing = validateRequired(['name', 'email', 'age'], req.body);
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing fields: ${missing.join(', ')}`
    });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }
  if (!validateAge(age)) {
    return res.status(400).json({ success: false, message: 'Age must be between 1 and 120' });
  }
  const newUser = {
    id: nextId++,
    name: name.trim(),
    email: email.toLowerCase(),
    age: Number(age)
  };
  users.push(newUser);
  res.status(201).json({ success: true, message: 'User created', data: newUser });
});

router.put('/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const { name, email, age } = req.body;
  if (name !== undefined) user.name = name.trim();
  if (email !== undefined) {
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    user.email = email.toLowerCase();
  }
  if (age !== undefined) {
    if (!validateAge(age)) {
      return res.status(400).json({ success: false, message: 'Age must be between 1 and 120' });
    }
    user.age = Number(age);
  }
  res.status(200).json({ success: true, message: 'User updated', data: user });
});

router.delete('/:id', (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  users.splice(index, 1);
  res.status(204).send();
});

module.exports = router;

module.exports = router;