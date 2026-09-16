import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';
import { TEEN_LESSONS } from '../constants/lessonSchema';

const packSound = require('../assets/sounds/pack.wav');
const wrongSound = require('../assets/sounds/wrong.wav');
const winSound = require('../assets/sounds/win.wav');

const TEAL = '#0EA5E9';
const INDIGO = '#4F46E5';
const CORAL = '#FF6B6B';
const SLATE = '#0F172A';
const CARD = '#1E293B';
const ERROR = '#EF4444';

export default function LessonScreen({ route, navigation }) {
  const { userId } = useUser();
  const { lessonId } = route.params;
  const lesson = TEEN_LESSONS.find(l => l.id === lessonId) || TEEN_LESSONS[0];
  const exercises = lesson.exercises;

  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [selected, setSelected] = useState(null);
  const [bankSelected, setBankSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState('playing'); // playing | done | failed

  const heartShake = useRef(new Animated.Value(0)).current;
  const feedbackY = useRef(new Animated.Value(200)).current;

  const packPlayer = useAudioPlayer(packSound);
  const wrongPlayer = useAudioPlayer(wrongSound);
  const winPlayer = useAudioPlayer(winSound);

  const ex = exercises[index];
  const progress = Math.round((index / exercises.length) * 100);

  const shakeHearts = () => {
    Animated.sequence([
      Animated.timing(heartShake, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(heartShake, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(heartShake, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(heartShake, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const showFeedback = () => {
    feedbackY.setValue(200);
    Animated.spring(feedbackY, { toValue: 0, useNativeDriver: true, bounciness: 8 }).start();
  };

  const isAnswerReady = () => {
    if (ex.type === 'select' || ex.type === 'truefalse') return selected !== null;
    if (ex.type === 'wordbank') return bankSelected.length > 0;
    return false;
  };

  const evaluate = () => {
    if (ex.type === 'select') return selected === ex.correct;
    if (ex.type === 'truefalse') return selected === ex.correct;
    if (ex.type === 'wordbank') {
      return bankSelected.length === ex.answer.length &&
        bankSelected.every((w, i) => w === ex.answer[i]);
    }
    return false;
  };

  const check = () => {
    const correct = evaluate();
    setWasCorrect(correct);
    setChecked(true);
    showFeedback();
    if (correct) {
      packPlayer.seekTo(0); packPlayer.play();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectCount(c => c + 1);
    } else {
      wrongPlayer.seekTo(0); wrongPlayer.play();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeHearts();
      const newHearts = hearts - 1;
      setHearts(newHearts);
      if (newHearts <= 0) {
        setTimeout(() => setPhase('failed'), 600);
      }
    }
  };

  const next = async () => {
    setChecked(false);
    setSelected(null);
    setBankSelected([]);
    if (index < exercises.length - 1) {
      setIndex(index + 1);
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

  const tapBankWord = (word, fromSelected, i) => {
    if (checked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (fromSelected) {
      setBankSelected(prev => prev.filter((_, idx) => idx !== i));
    } else {
      setBankSelected(prev => [...prev, word]);
    }
  };

  const availableBank = () => {
    const used = [...bankSelected];
    return ex.bank.filter(w => {
      const i = used.indexOf(w);
      if (i >= 0) { used.splice(i, 1); return false; }
      return true;
    });
  };

  // ---- COMPLETION ----
  if (phase === 'done') {
    const accuracy = Math.round((correctCount / exercises.length) * 100);
    return (
      <View style={styles.completeScreen}>
        <Text style={styles.completeEmoji}>⚡🎉</Text>
        <Text style={styles.completeTitle}>Lesson Complete!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: CORAL }]}>+{lesson.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: TEAL }]}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: CORAL }]}>{hearts}</Text>
            <Text style={styles.statLabel}>Hearts left</Text>
          </View>
        </View>
        <Text style={styles.completeSub}>The next lesson is now unlocked.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'failed') {
    return (
      <View style={styles.completeScreen}>
        <Text style={styles.completeEmoji}>💔</Text>
        <Text style={styles.completeTitle}>Out of hearts!</Text>
        <Text style={styles.completeSub}>No worries — review and try again. Repetition is how it sticks.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => {
          setIndex(0); setHearts(5); setCorrectCount(0); setChecked(false);
          setSelected(null); setBankSelected([]); setPhase('playing');
        }}>
          <Text style={styles.primaryBtnText}>TRY AGAIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryBtnText}>Back to Path</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---- PLAYING ----
  return (
    <View style={styles.screen}>
      {/* Header: progress + hearts */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Animated.View style={[styles.heartsBox, { transform: [{ translateX: heartShake }] }]}>
          <Text style={styles.heartIcon}>❤️</Text>
          <Text style={styles.heartCount}>{hearts}</Text>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.prompt}>{ex.prompt}</Text>

        {/* SELECT */}
        {ex.type === 'select' && ex.options.map((opt, i) => {
          let optStyle = [styles.option];
          if (checked && i === ex.correct) optStyle.push(styles.optionCorrect);
          else if (checked && i === selected) optStyle.push(styles.optionWrong);
          else if (selected === i) optStyle.push(styles.optionSelected);
          return (
            <TouchableOpacity key={i} style={optStyle} disabled={checked} onPress={() => { setSelected(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}

        {/* TRUE / FALSE */}
        {ex.type === 'truefalse' && [true, false].map((val, i) => {
          const isSel = selected === val;
          let optStyle = [styles.option];
          if (checked && val === ex.correct) optStyle.push(styles.optionCorrect);
          else if (checked && isSel) optStyle.push(styles.optionWrong);
          else if (isSel) optStyle.push(styles.optionSelected);
          return (
            <TouchableOpacity key={i} style={optStyle} disabled={checked} onPress={() => { setSelected(val); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <Text style={styles.optionText}>{val ? '✅ True' : '❌ False'}</Text>
            </TouchableOpacity>
          );
        })}

        {/* WORD BANK */}
        {ex.type === 'wordbank' && (
          <>
            <View style={styles.answerLine}>
              {bankSelected.length === 0 && <Text style={styles.answerPlaceholder}>Tap words to build your answer...</Text>}
              {bankSelected.map((w, i) => (
                <TouchableOpacity key={i} style={styles.chipSelected} onPress={() => tapBankWord(w, true, i)}>
                  <Text style={styles.chipText}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.bankPool}>
              {availableBank().map((w, i) => (
                <TouchableOpacity key={i} style={styles.chip} onPress={() => tapBankWord(w, false, i)}>
                  <Text style={styles.chipText}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Feedback bar */}
      {checked && (
        <Animated.View style={[styles.feedbackBar, wasCorrect ? styles.feedbackGood : styles.feedbackBad, { transform: [{ translateY: feedbackY }] }]}>
          <Text style={styles.feedbackTitle}>{wasCorrect ? '✅ Correct!' : '❌ Not quite'}</Text>
          {!wasCorrect && ex.explain && <Text style={styles.feedbackText}>{ex.explain}</Text>}
          {!wasCorrect && ex.type === 'wordbank' && <Text style={styles.feedbackText}>Answer: {ex.answer.join(' ')}</Text>}
          {!wasCorrect && ex.type === 'select' && <Text style={styles.feedbackText}>Answer: {ex.options[ex.correct]}</Text>}
          <TouchableOpacity style={styles.continueBtn} onPress={next}>
            <Text style={styles.continueBtnText}>CONTINUE</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Check button */}
      {!checked && (
        <View style={styles.checkBar}>
          <TouchableOpacity
            style={[styles.checkBtn, !isAnswerReady() && styles.checkBtnDisabled]}
            disabled={!isAnswerReady()}
            onPress={check}
          >
            <Text style={styles.checkBtnText}>CHECK</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SLATE },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8 },
  closeBtn: { color: '#64748B', fontSize: 22, fontWeight: 'bold', marginRight: 12 },
  progressTrack: { flex: 1, height: 14, backgroundColor: '#334155', borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: TEAL, borderRadius: 7 },
  heartsBox: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  heartIcon: { fontSize: 18 },
  heartCount: { color: CORAL, fontWeight: 'bold', fontSize: 16, marginLeft: 4 },

  body: { padding: 24, paddingBottom: 140 },
  prompt: { color: '#F8FAFC', fontSize: 22, fontWeight: 'bold', marginBottom: 24, lineHeight: 30 },

  option: { backgroundColor: CARD, borderRadius: 14, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 5, padding: 16, marginBottom: 12 },
  optionSelected: { borderColor: TEAL, backgroundColor: '#12344a' },
  optionCorrect: { borderColor: TEAL, backgroundColor: '#0c4a6e' },
  optionWrong: { borderColor: ERROR, backgroundColor: '#4a1616' },
  optionText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },

  answerLine: { flexDirection: 'row', flexWrap: 'wrap', minHeight: 56, borderBottomWidth: 2, borderColor: '#334155', paddingBottom: 12, marginBottom: 24 },
  answerPlaceholder: { color: '#64748B', fontStyle: 'italic', alignSelf: 'center' },
  bankPool: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: CARD, borderRadius: 12, borderWidth: 2, borderColor: '#334155', borderBottomWidth: 4, paddingVertical: 10, paddingHorizontal: 14, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: '#12344a', borderRadius: 12, borderWidth: 2, borderColor: TEAL, paddingVertical: 8, paddingHorizontal: 12, marginRight: 6, marginBottom: 6 },
  chipText: { color: '#F8FAFC', fontSize: 15, fontWeight: '600' },

  checkBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: SLATE, borderTopWidth: 1, borderColor: '#1E293B' },
  checkBtn: { backgroundColor: TEAL, borderRadius: 14, borderBottomWidth: 4, borderColor: '#0784b8', padding: 16, alignItems: 'center' },
  checkBtnDisabled: { backgroundColor: '#334155', borderColor: '#293548' },
  checkBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  feedbackBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 28, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  feedbackGood: { backgroundColor: '#0c4a6e' },
  feedbackBad: { backgroundColor: '#4a1616' },
  feedbackTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  feedbackText: { color: '#E2E8F0', fontSize: 14, marginBottom: 12, lineHeight: 20 },
  continueBtn: { backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 6 },
  continueBtnText: { color: SLATE, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  completeScreen: { flex: 1, backgroundColor: SLATE, justifyContent: 'center', alignItems: 'center', padding: 28 },
  completeEmoji: { fontSize: 60, marginBottom: 12 },
  completeTitle: { color: '#F8FAFC', fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginBottom: 24 },
  statBox: { alignItems: 'center', marginHorizontal: 16 },
  statNum: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  completeSub: { color: '#94A3B8', fontSize: 15, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  primaryBtn: { backgroundColor: TEAL, borderRadius: 14, borderBottomWidth: 4, borderColor: '#0784b8', paddingVertical: 16, paddingHorizontal: 48 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  secondaryBtn: { marginTop: 14 },
  secondaryBtnText: { color: '#64748B', fontWeight: 'bold', fontSize: 15 }
});