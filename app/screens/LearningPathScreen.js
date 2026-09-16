import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';
import { TEEN_LESSONS as LESSONS } from '../constants/lessonSchema';

export default function LearningPathScreen({ navigation }) {
  const { userId } = useUser();
  const [completed, setCompleted] = useState([]);

  const load = async () => {
    try {
      const res = await apiRequest(`/gamification/lessons?userId=${userId}`, 'GET');
      setCompleted(res.completedLessons || []);
    } catch (err) {
      console.log('Lessons load error:', err.message);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [userId]));

  const isUnlocked = (index) => {
    if (index === 0) return true;
    return completed.includes(LESSONS[index - 1].id);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Preparedness Path</Text>
      <Text style={styles.sub}>Complete lessons to unlock the next. Earn XP as you go.</Text>

      {LESSONS.map((lesson, index) => {
        const done = completed.includes(lesson.id);
        const unlocked = isUnlocked(index);
        const align = index % 2 === 0 ? 'flex-start' : 'flex-end';

        return (
          <View key={lesson.id} style={{ width: '100%', alignItems: 'center' }}>
            {index > 0 && <View style={[styles.connector, done || unlocked ? styles.connectorActive : null]} />}
            <View style={{ width: '100%', alignItems: align }}>
              <TouchableOpacity
                style={[
                  styles.node,
                  done ? styles.nodeDone : unlocked ? styles.nodeActive : styles.nodeLocked
                ]}
                disabled={!unlocked}
                onPress={() => navigation.navigate('Lesson', { lessonId: lesson.id })}
              >
                <Text style={styles.nodeEmoji}>{done ? '✅' : unlocked ? lesson.emoji : '🔒'}</Text>
              </TouchableOpacity>
              <Text style={[styles.nodeLabel, !unlocked && styles.nodeLabelLocked, { textAlign: align === 'flex-start' ? 'left' : 'right' }]}>
                {lesson.title}
              </Text>
            </View>
          </View>
        );
      })}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {completed.length === LESSONS.length ? '🎉 Path complete! You\'re a preparedness pro.' : `${completed.length}/${LESSONS.length} lessons done`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F172A' },
  container: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#F8FAFC' },
  sub: { fontSize: 14, color: '#94A3B8', marginBottom: 24 },
  connector: { width: 4, height: 28, backgroundColor: '#334155' },
  connectorActive: { backgroundColor: '#0EA5E9' },
  node: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 4 },
  nodeDone: { backgroundColor: '#0EA5E9', borderColor: '#38BDF8' },
  nodeActive: { backgroundColor: '#1E293B', borderColor: '#0EA5E9' },
  nodeLocked: { backgroundColor: '#1E293B', borderColor: '#334155' },
  nodeEmoji: { fontSize: 32 },
  nodeLabel: { color: '#F8FAFC', fontSize: 13, fontWeight: 'bold', marginTop: 6, marginBottom: 4, maxWidth: 160 },
  nodeLabelLocked: { color: '#64748B' },
  footer: { marginTop: 24, backgroundColor: '#1E293B', borderRadius: 14, padding: 16, alignItems: 'center' },
  footerText: { color: '#0EA5E9', fontWeight: 'bold', fontSize: 14 }
});