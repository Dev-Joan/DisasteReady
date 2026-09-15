const express = require('express');
const router = express.Router();
const alertsService = require('../services/alertsService');

router.get('/active', (req, res) => {
  const { region } = req.query;
  const alerts = alertsService.getActiveAlerts(region || 'ALL');
  res.status(200).json({ alerts });
});

module.exports = router;