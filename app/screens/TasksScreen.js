import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';

export default function TasksScreen() {
  const { userId } = useUser();
  const [tasks, setTasks] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);

  const load = async () => {
    try {
      const result = await apiRequest(`/gamification/tasks?userId=${userId}`, 'GET');
      setTasks(result.tasks);
      setCompletedToday(result.completedToday);
    } catch (err) {
      console.log('Tasks error:', err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const completeTask = async (taskId) => {
    try {
      const result = await apiRequest('/gamification/complete-task', 'POST', { userId, taskId });
      Alert.alert('Task complete! 🎉', `You now have ${result.points} points (${result.rank}).`);
      load();
    } catch (err) {
      Alert.alert('Oops', err.message);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>⚡ Daily Tasks</Text>
      <Text style={styles.subtitle}>Small real-world actions that keep you prepared</Text>

      {tasks.map((task) => {
        const done = completedToday.includes(task.taskId);
        return (
          <View key={task.taskId} style={[styles.taskCard, done && styles.taskDone]}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{done ? '✅ ' : ''}{task.title}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <Text style={styles.taskPoints}>+{task.pointsAwarded} points</Text>
            </View>
            {!done && (
              <TouchableOpacity style={styles.doneButton} onPress={() => completeTask(task.taskId)}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  taskCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1
  },
  taskDone: { opacity: 0.6 },
  taskInfo: { flex: 1, paddingRight: 12 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  taskDescription: { fontSize: 13, color: '#64748B', marginTop: 4 },
  taskPoints: { fontSize: 12, color: '#D97706', fontWeight: 'bold', marginTop: 6 },
  doneButton: { backgroundColor: '#059669', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 },
  doneButtonText: { color: '#fff', fontWeight: 'bold' }
});