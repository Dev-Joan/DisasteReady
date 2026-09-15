const fs = require('fs');
const path = require('path');

const alertsPath = path.join(__dirname, '../data/alerts.json');

function getActiveAlerts(region) {
  const alerts = JSON.parse(fs.readFileSync(alertsPath, 'utf8'));
  return alerts.filter(a => a.active && (a.region === region || a.region === 'ALL'));
}

module.exports = { getActiveAlerts };