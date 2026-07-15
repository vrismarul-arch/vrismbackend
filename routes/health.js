// routes/health.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: process.env.npm_package_version || '1.0.0'
  });
});

module.exports = router;