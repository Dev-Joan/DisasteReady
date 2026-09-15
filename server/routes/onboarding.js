const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}
function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

router.get('/profile', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const users = loadUsers();
  const user = users.find(u => u.userId === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.status(200).json({
    userId: user.userId,
    name: user.name || null,
    age: user.age || null,
    region: user.region || null,
    country: user.country || null,
    experienceMode: user.experienceMode || null,
    relevantHazards: user.relevantHazards || [],
    accessibilitySettings: user.accessibilitySettings || {},
    theme: user.theme || 'light'
  });
});

router.post('/theme', (req, res) => {
  const { userId, theme } = req.body;
  if (!userId || !theme) return res.status(400).json({ error: 'userId and theme are required' });

  const users = loadUsers();
  const user = users.find(u => u.userId === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.theme = theme;
  saveUsers(users);
  res.status(200).json({ userId, theme });
});

module.exports = router;