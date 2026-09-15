import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';

const TOPICS = ['earthquake', 'flood'];

export default function QuizScreen() {
  const { userId } = useUser();
  const [topic, setTopic] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const fetchQuestion = async (selectedTopic) => {
    setTopic(selectedTopic);
    setLastResult(null);
    setAnswerText('');

    try {
      const result = await apiRequest(`/quiz/next-question?userId=${userId}&topic=${selectedTopic}`, 'GET');
      if (result.message) {
        setQuestion(null);
        Alert.alert('No more questions', result.message);
      } else {
        setQuestion(result);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const submitAnswer = async (wasCorrect) => {
    try {
      const result = await apiRequest('/quiz/answer', 'POST', {
        userId,
        topic,
        wasCorrect
      });
      setLastResult(result);
      setQuestion(null);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Adaptive Quiz</Text>

      <View style={styles.topicRow}>
        {TOPICS.map((t) => (
          <TouchableOpacity key={t} style={styles.topicButton} onPress={() => fetchQuestion(t)}>
            <Text style={styles.topicButtonText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {question && (
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>{question.text}</Text>
          <Text style={styles.difficultyText}>Difficulty: {question.difficulty}</Text>

          <Text style={styles.hint}>(For this prototype, mark whether you got it right)</Text>
          <View style={styles.answerRow}>
            <TouchableOpacity style={styles.correctButton} onPress={() => submitAnswer(true)}>
              <Text style={styles.buttonText}>I got it right</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.wrongButton} onPress={() => submitAnswer(false)}>
              <Text style={styles.buttonText}>I got it wrong</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {lastResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>New difficulty: {lastResult.newDifficulty}</Text>
          <Text style={styles.resultText}>Accuracy: {lastResult.accuracy}</Text>
          <Text style={styles.resultText}>Mastered: {lastResult.mastered ? 'Yes' : 'No'}</Text>
          {lastResult.gamification && (
            <Text style={styles.resultText}>Points: {lastResult.gamification.points}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={() => fetchQuestion(topic)}>
            <Text style={styles.buttonText}>Next Question</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  topicRow: { flexDirection: 'row', marginBottom: 24 },
  topicButton: { backgroundColor: '#eee', padding: 12, borderRadius: 8, marginRight: 12 },
  topicButtonText: { fontWeight: 'bold' },
  questionBox: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 },
  questionText: { fontSize: 16, marginBottom: 8 },
  difficultyText: { fontSize: 14, color: '#666', marginBottom: 12 },
  hint: { fontSize: 12, color: '#999', marginBottom: 8 },
  answerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  correctButton: { backgroundColor: '#27ae60', padding: 12, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' },
  wrongButton: { backgroundColor: '#c0392b', padding: 12, borderRadius: 8, flex: 1, marginLeft: 8, alignItems: 'center' },
  resultBox: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8 },
  resultText: { fontSize: 16, marginBottom: 4 },
  button: { backgroundColor: '#c0392b', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});