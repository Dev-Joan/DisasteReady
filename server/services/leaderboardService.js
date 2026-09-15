const fs = require('fs');
const path = require('path');

const gamificationPath = path.join(__dirname, '../data/gamificationState.json');
const usersPath = path.join(__dirname, '../data/users.json');

function getTopUsers(limit = 10) {
  const gamificationState = JSON.parse(fs.readFileSync(gamificationPath, 'utf8'));
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

  const combined = gamificationState.map(state => {
    const user = users.find(u => u.userId === state.userId);
    return {
      userId: state.userId,
      username: user ? user.username : 'Unknown',
      points: state.points,
      rank: state.rank
    };
  });

  combined.sort((a, b) => b.points - a.points);
  return combined.slice(0, limit);
}

module.exports = { getTopUsers };