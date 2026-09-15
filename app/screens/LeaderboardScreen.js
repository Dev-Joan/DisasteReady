import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';

export default function LeaderboardScreen() {
  const { userId } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await apiRequest('/leaderboard/top', 'GET');
        setLeaderboard(result.leaderboard);
      } catch (err) {
        console.log('Leaderboard error:', err.message);
      }
    };
    load();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      <Text style={styles.subtitle}>Top preparedness champions</Text>

      {leaderboard.map((entry, index) => (
        <View
          key={entry.userId}
          style={[styles.row, entry.userId === userId && styles.rowHighlight]}
        >
          <Text style={styles.medal}>{medals[index] || `${index + 1}.`}</Text>
          <View style={styles.rowInfo}>
            <Text style={styles.rowName}>
              {entry.username}{entry.userId === userId ? ' (You)' : ''}
            </Text>
            <Text style={styles.rowRank}>{entry.rank}</Text>
          </View>
          <Text style={styles.rowPoints}>{entry.points} XP</Text>
        </View>
      ))}

      {leaderboard.length === 0 && (
        <Text style={styles.empty}>No players yet — be the first!</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1
  },
  rowHighlight: { borderWidth: 2, borderColor: '#F57C00' },
  medal: { fontSize: 22, width: 40 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  rowRank: { fontSize: 12, color: '#64748B' },
  rowPoints: { fontSize: 16, fontWeight: 'bold', color: '#D97706' },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 40 }
});