const express = require('express');
const router = express.Router();
const leaderboardService = require('../services/leaderboardService');

router.get('/top', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const topUsers = leaderboardService.getTopUsers(limit);
  res.status(200).json({ leaderboard: topUsers });
});

module.exports = router;