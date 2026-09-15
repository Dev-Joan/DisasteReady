const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function mapAgeToExperienceMode(age) {
  if (age >= 6 && age <= 12) return 'child';
  if (age >= 13 && age <= 17) return 'teen';
  if (age >= 18 && age <= 64) return 'adult';
  if (age >= 65) return 'elderly';
  return 'adult'; // default fallback
}

const regionHazardMap = {
  'UK': ['flood', 'severe_weather'],
  'US': ['earthquake', 'flood', 'severe_weather'],
  'Japan': ['earthquake', 'flood'],
  'default': ['earthquake', 'flood']
};

function mapRegionToHazards(region) {
  return regionHazardMap[region] || regionHazardMap['default'];
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

function completeOnboarding(userId, { name, age, region, accessibilityFlags }) {
  const users = loadUsers();
  const user = users.find(u => u.userId === userId);

  if (!user) {
    throw new Error('User not found');
  }

  const experienceMode = mapAgeToExperienceMode(age);
  const relevantHazards = mapRegionToHazards(region);
  const accessibilitySettings = mapAccessibilityFlags(accessibilityFlags);

  user.name = name;
  user.age = age;
  user.region = region;
  user.accessibilityFlags = accessibilityFlags || [];
  user.experienceMode = experienceMode;
  user.relevantHazards = relevantHazards;
  user.accessibilitySettings = accessibilitySettings;

  saveUsers(users);

  return { userId, experienceMode, relevantHazards, accessibilitySettings };
}

module.exports = { completeOnboarding };