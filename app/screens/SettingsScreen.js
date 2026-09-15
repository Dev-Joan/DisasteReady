import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { userId } = useUser();
  const { theme, themeName, toggleTheme } = useTheme();

  const handleToggle = async () => {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    toggleTheme();
    try {
      await apiRequest('/onboarding/theme', 'POST', { userId, theme: newTheme });
    } catch (err) {
      console.log('Theme save error:', err.message);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View>
          <Text style={[styles.rowLabel, { color: theme.text }]}>
            {themeName === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Text>
          <Text style={[styles.rowSub, { color: theme.textSub }]}>
            Switch between light and dark appearance
          </Text>
        </View>
        <Switch
          value={themeName === 'dark'}
          onValueChange={handleToggle}
          trackColor={{ false: '#CBD5E1', true: '#F57C00' }}
          thumbColor="#fff"
        />
      </View>

      <Text style={[styles.note, { color: theme.textSub }]}>
        Your choice is saved to your account.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 14, borderWidth: 1, padding: 18
  },
  rowLabel: { fontSize: 16, fontWeight: 'bold' },
  rowSub: { fontSize: 12, marginTop: 4, maxWidth: 200 },
  note: { fontSize: 12, marginTop: 16, textAlign: 'center' }
});