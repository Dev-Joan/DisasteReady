import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';
import { LESSONS } from '../constants/lessons';

const packSound = require('../assets/sounds/pack.wav');
const wrongSound = require('../assets/sounds/wrong.wav');
const winSound = require('../assets/sounds/win.wav');

export default function LessonScreen({ route, navigation }) {
  const { userId } = useUser();
  const { lessonId } = route.params;
  const lesson = LESSONS.find(l => l.id === lessonId);

  const [phase, setPhase] = useState('teach'); // teach | quiz | done
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const packPlayer = useAudioPlayer(packSound);
  const wrongPlayer = useAudioPlayer(wrongSound);
  const winPlayer = useAudioPlayer(winSound);

  const question = lesson.questions[qIndex];

  const answer = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === question.correct) {
      packPlayer.seekTo(0); packPlayer.play();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectCount((c) => c + 1);
    } else {
      wrongPlayer.seekTo(0); wrongPlayer.play();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const next = async () => {
    if (qIndex < lesson.questions.length - 1) {
      setQIndex(qIndex + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      winPlayer.seekTo(0); winPlayer.play();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase('done');
      try {
        await apiRequest('/gamification/lesson-complete', 'POST', { userId, lessonId });
      } catch (err) {
        console.log('Lesson complete error:', err.message);
      }
    }
  };

  if (phase === 'teach') {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <View style={styles.teachCard}>
          <Text style={styles.teachText}>{lesson.teach}</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setPhase('quiz')}>
          <Text style={styles.primaryButtonText}>Got it — Start Quiz ▶</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (phase === 'done') {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.bigEmoji}>⚡</Text>
        <Text style={styles.lessonTitle}>Lesson Complete!</Text>
        <Text style={styles.doneText}>
          You got {correctCount}/{lesson.questions.length} correct.{'\n\n'}
          +20 XP earned! The next lesson is now unlocked.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Back to Path</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.progress}>Question {qIndex + 1} of {lesson.questions.length}</Text>
      <Text style={styles.question}>{question.q}</Text>

      {question.options.map((opt, i) => {
        let optStyle = styles.option;
        if (answered && i === question.correct) optStyle = styles.optionCorrect;
        else if (answered && i === selected) optStyle = styles.optionWrong;
        return (
          <TouchableOpacity key={i} style={optStyle} onPress={() => answer(i)} disabled={answered}>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        );
      })}

      {answered && (
        <TouchableOpacity style={styles.primaryButton} onPress={next}>
          <Text style={styles.primaryButtonText}>
            {qIndex < lesson.questions.length - 1 ? 'Next ▶' : 'Finish ⚡'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F172A' },
  container: { padding: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  lessonEmoji: { fontSize: 56, textAlign: 'center', marginBottom: 8 },
  bigEmoji: { fontSize: 56, marginBottom: 12 },
  lessonTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 20 },
  teachCard: { backgroundColor: '#1E293B', borderRadius: 18, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  teachText: { fontSize: 16, color: '#CBD5E1', lineHeight: 26 },
  progress: { fontSize: 13, color: '#94A3B8', fontWeight: 'bold', marginBottom: 12 },
  question: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 20, lineHeight: 28 },
  option: { backgroundColor: '#1E293B', borderRadius: 14, borderWidth: 2, borderColor: '#334155', padding: 16, marginBottom: 12 },
  optionCorrect: { backgroundColor: '#065F46', borderRadius: 14, borderWidth: 2, borderColor: '#34D399', padding: 16, marginBottom: 12 },
  optionWrong: { backgroundColor: '#7F1D1D', borderRadius: 14, borderWidth: 2, borderColor: '#F87171', padding: 16, marginBottom: 12 },
  optionText: { fontSize: 15, color: '#F8FAFC', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#0EA5E9', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  doneText: { fontSize: 16, color: '#CBD5E1', textAlign: 'center', lineHeight: 24, marginBottom: 24 }
});