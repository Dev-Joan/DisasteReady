const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const gamificationEngine = require('../services/gamificationEngine');

const dailyTasksPath = path.join(__dirname, '../data/dailyTasks.json');
const gamificationPath = path.join(__dirname, '../data/gamificationState.json');

function loadState() {
  return JSON.parse(fs.readFileSync(gamificationPath, 'utf8'));
}
function saveState(s) {
  fs.writeFileSync(gamificationPath, JSON.stringify(s, null, 2));
}

router.post('/login', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  try {
    const result = gamificationEngine.recordLogin(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/complete-task', (req, res) => {
  const { userId, taskId } = req.body;
  if (!userId || !taskId) return res.status(400).json({ error: 'userId and taskId are required' });
  try {
    const result = gamificationEngine.completeDailyTask(userId, taskId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/tasks', (req, res) => {
  const { userId } = req.query;
  const tasks = JSON.parse(fs.readFileSync(dailyTasksPath, 'utf8'));
  let completedToday = [];
  if (userId) {
    const allState = loadState();
    const userState = allState.find(s => s.userId === userId);
    if (userState) {
      const today = new Date().toISOString().split('T')[0];
      completedToday = userState.dailyTasksCompleted.filter(e => e.date === today).map(e => e.taskId);
    }
  }
  res.status(200).json({ tasks, completedToday });
});

router.post('/kit-complete', (req, res) => {
  const { userId, kitId } = req.body;
  if (!userId || !kitId) return res.status(400).json({ error: 'userId and kitId are required' });
  try {
    let result = gamificationEngine.awardPoints(userId, 30);
    const badgeMap = { 'flood_kids': 'flood_kids', 'earthquake_kids': 'earthquake_kids', 'fire_kids': 'fire_kids' };
    const badgeId = badgeMap[kitId];
    if (badgeId) result = gamificationEngine.awardBadge(userId, badgeId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/story-complete', (req, res) => {
  const { userId, storyId } = req.body;
  if (!userId || !storyId) return res.status(400).json({ error: 'userId and storyId are required' });
  try {
    const result = gamificationEngine.awardPoints(userId, 30);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/lessons', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const allState = loadState();
  const userState = allState.find(s => s.userId === userId);
  const completedLessons = (userState && userState.completedLessons) || [];
  res.status(200).json({ completedLessons });
});

router.post('/lesson-complete', (req, res) => {
  const { userId, lessonId, xp } = req.body;
  if (!userId || !lessonId) return res.status(400).json({ error: 'userId and lessonId are required' });

  const allState = loadState();
  const userState = allState.find(s => s.userId === userId);
  if (!userState) return res.status(404).json({ error: 'User not found' });

  if (!userState.completedLessons) userState.completedLessons = [];
  const alreadyDone = userState.completedLessons.includes(lessonId);
  if (!alreadyDone) userState.completedLessons.push(lessonId);
  saveState(allState);

  let result = userState;
  if (!alreadyDone) {
    const awarded = Number.isFinite(xp) && xp > 0 ? xp : 20;
    result = gamificationEngine.awardPoints(userId, awarded);
  }
  res.status(200).json({ ...result, completedLessons: userState.completedLessons, alreadyDone });
});

module.exports = router;