const fs = require('fs');
const path = require('path');

const gamificationPath = path.join(__dirname, '../data/gamificationState.json');
const dailyTasksPath = path.join(__dirname, '../data/dailyTasks.json');

function loadGamificationState() {
  return JSON.parse(fs.readFileSync(gamificationPath, 'utf8'));
}

function saveGamificationState(state) {
  fs.writeFileSync(gamificationPath, JSON.stringify(state, null, 2));
}

function loadDailyTasks() {
  return JSON.parse(fs.readFileSync(dailyTasksPath, 'utf8'));
}

function getUserState(userId) {
  const allState = loadGamificationState();
  const userState = allState.find(s => s.userId === userId);
  if (!userState) throw new Error('User gamification state not found');
  return { allState, userState };
}

function calculateRank(points) {
  if (points >= 600) return 'Guardian';
  if (points >= 300) return 'Resilient';
  if (points >= 100) return 'Prepared';
  return 'Novice';
}

function awardPoints(userId, points) {
  const { allState, userState } = getUserState(userId);

  userState.points += points;

  const newRank = calculateRank(userState.points);
  if (newRank !== userState.rank) {
    userState.rank = newRank;
    const rankBadgeMap = {
      'Prepared': 'rank_prepared',
      'Resilient': 'rank_resilient',
      'Guardian': 'rank_guardian'
    };
    const badgeId = rankBadgeMap[newRank];
    if (badgeId && !userState.badges.includes(badgeId)) {
      userState.badges.push(badgeId);
    }
  }

  saveGamificationState(allState);
  return userState;
}

function awardBadge(userId, badgeId) {
  const { allState, userState } = getUserState(userId);

  if (!userState.badges.includes(badgeId)) {
    userState.badges.push(badgeId);
  }

  saveGamificationState(allState);
  return userState;
}

function awardTopicMasteryBadge(userId, topic) {
  return awardBadge(userId, `${topic}_mastered`);
}

function recordLogin(userId) {
  const { allState, userState } = getUserState(userId);

  const today = new Date().toISOString().split('T')[0];
  const lastDate = userState.lastActiveDate;

  if (lastDate === today) {
    // already logged in today, no change
  } else if (isYesterday(lastDate, today)) {
    userState.currentStreak += 1;
  } else {
    userState.currentStreak = 1;
  }

  if (userState.currentStreak > userState.longestStreak) {
    userState.longestStreak = userState.currentStreak;
  }

  if (userState.currentStreak === 7 && !userState.badges.includes('streak_7')) {
    userState.badges.push('streak_7');
  }

  userState.lastActiveDate = today;
  saveGamificationState(allState);
  return userState;
}

function isYesterday(lastDateStr, todayStr) {
  if (!lastDateStr) return false;
  const last = new Date(lastDateStr);
  const today = new Date(todayStr);
  const diffDays = (today - last) / (1000 * 60 * 60 * 24);
  return diffDays === 1;
}

function completeDailyTask(userId, taskId) {
  const { allState, userState } = getUserState(userId);
  const tasks = loadDailyTasks();
  const task = tasks.find(t => t.taskId === taskId);

  if (!task) throw new Error('Task not found');

  const today = new Date().toISOString().split('T')[0];
  const alreadyDone = userState.dailyTasksCompleted.some(
    entry => entry.taskId === taskId && entry.date === today
  );

  if (alreadyDone) {
    throw new Error('Task already completed today');
  }

  userState.dailyTasksCompleted.push({ taskId, date: today });
  saveGamificationState(allState);

  return awardPoints(userId, task.pointsAwarded);
}

module.exports = {
  awardPoints,
  awardBadge,
  awardTopicMasteryBadge,
  recordLogin,
  completeDailyTask,
  calculateRank
};