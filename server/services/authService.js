const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersPath = path.join(__dirname, '../data/users.json');
const gamificationPath = path.join(__dirname, '../data/gamificationState.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function loadGamificationState() {
  return JSON.parse(fs.readFileSync(gamificationPath, 'utf8'));
}

function saveGamificationState(state) {
  fs.writeFileSync(gamificationPath, JSON.stringify(state, null, 2));
}

function mapAgeToExperienceMode(age) {
  if (age >= 5 && age <= 12) return 'child';
  if (age >= 13 && age <= 24) return 'teen';
  if (age >= 25 && age <= 49) return 'adult';
  if (age >= 50) return 'elderly';
  return 'adult';
}

const countryHazardMap = {
  'Lebanon': ['earthquake', 'flood', 'wildfire'],
  'UAE': ['severe_weather', 'flood'],
  'Saudi Arabia': ['flood', 'severe_weather'],
  'Egypt': ['flood', 'earthquake'],
  'South Africa': ['flood', 'wildfire'],
  'UK': ['flood', 'severe_weather'],
  'France': ['flood', 'severe_weather', 'wildfire'],
  'Germany': ['flood', 'severe_weather'],
  'Italy': ['earthquake', 'flood'],
  'Greece': ['earthquake', 'wildfire'],
  'Japan': ['earthquake', 'flood', 'severe_weather'],
  'India': ['flood', 'severe_weather', 'earthquake'],
  'Philippines': ['severe_weather', 'flood', 'earthquake'],
  'Indonesia': ['earthquake', 'flood'],
  'China': ['flood', 'earthquake'],
  'US': ['earthquake', 'flood', 'severe_weather', 'wildfire'],
  'Canada': ['wildfire', 'flood', 'severe_weather'],
  'Mexico': ['earthquake', 'severe_weather'],
  'Brazil': ['flood', 'severe_weather'],
  'Argentina': ['flood', 'severe_weather'],
  'default': ['earthquake', 'flood']
};

function mapCountryToHazards(country) {
  return countryHazardMap[country] || countryHazardMap['default'];
}

function mapAccessibilityFlags(flags) {
  const settings = {
    screenReaderOptimised: false,
    largerTouchTargets: false,
    simplifiedNavigation: false
  };

  if (!flags || flags.length === 0) return settings;

  if (flags.includes('visual')) settings.screenReaderOptimised = true;
  if (flags.includes('motor')) settings.largerTouchTargets = true;
  if (flags.includes('cognitive')) settings.simplifiedNavigation = true;

  return settings;
}

function signup({ username, password, name, age, region, country, accessibilityFlags }) {
  const users = loadUsers();

  const existing = users.find(u => u.username === username);
  if (existing) {
    throw new Error('Username already taken');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = 'u_' + Date.now();

  const experienceMode = mapAgeToExperienceMode(age);
  const relevantHazards = mapCountryToHazards(country);
  const accessibilitySettings = mapAccessibilityFlags(accessibilityFlags);

  const newUser = {
    userId,
    username,
    password: hashedPassword,
    name,
    age,
    region,
    country,
    accessibilityFlags: accessibilityFlags || [],
    experienceMode,
    relevantHazards,
    accessibilitySettings
  };
  users.push(newUser);
  saveUsers(users);

  const gamificationState = loadGamificationState();
  gamificationState.push({
    userId,
    points: 0,
    rank: 'Novice',
    badges: [],
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    dailyTasksCompleted: []
  });
  saveGamificationState(gamificationState);

  return { userId, username, experienceMode };
}

function login(username, password) {
  const users = loadUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    throw new Error('Invalid username or password');
  }

  const passwordMatches = bcrypt.compareSync(password, user.password);
  if (!passwordMatches) {
    throw new Error('Invalid username or password');
  }

  return { userId: user.userId, username: user.username, experienceMode: user.experienceMode || null };
}

module.exports = { signup, login };