// backend/routes/adminAuth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Dummy admin credentials (replace with env vars later)
const ADMIN_EMAIL = 'prajyot@arnavi.com';
const ADMIN_PASSWORD = 'prajyot@2000';
const JWT_SECRET = 'arnavi-secret-key'; // should be stored securely

// POST /admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
