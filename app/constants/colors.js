export const EMERGENCY_COLORS = {
  critical: '#D32F2F',
  warning: '#F57C00',
  advisory: '#FBC02D',
  safe: '#2E7D32',
  neutralDark: '#1E293B'
};

export const AGE_PALETTES = {
  child: {
    primary: '#FFB70D',
    secondary: '#38BDF8',
    reward: '#34D399',
    background: '#FAF8F5',
    text: '#1E293B'
  },
  teen: {
    primary: '#0EA5E9',
    secondary: '#4F46E5',
    streak: '#FF6B6B',
    background: '#0F172A',
    text: '#F8FAFC'
  },
  adult: {
    primary: '#1E3A8A',
    secondary: '#059669',
    highlight: '#D97706',
    background: '#F8FAFC',
    text: '#1E293B'
  },
  elderly: {
    primary: '#1E3A8A',
    secondary: '#059669',
    highlight: '#D97706',
    background: '#F8FAFC',
    text: '#1E293B'
  }
};

export function getPaletteForMode(experienceMode) {
  return AGE_PALETTES[experienceMode] || AGE_PALETTES.adult;
}