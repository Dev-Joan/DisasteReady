import React, { createContext, useState, useContext } from 'react';

export const THEMES = {
  light: {
    name: 'light',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    textSub: '#64748B',
    border: '#E2E8F0',
    inputBg: '#FFFFFF',
    headerBg: '#FFFFFF'
  },
  dark: {
    name: 'dark',
    bg: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    textSub: '#94A3B8',
    border: '#334155',
    inputBg: '#0F172A',
    headerBg: '#1E293B'
  }
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('light');
  const theme = THEMES[themeName];

  const toggleTheme = () => setThemeName((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}