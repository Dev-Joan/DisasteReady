import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';
import { EMERGENCY_COLORS } from '../constants/colors';

const KID_BADGES = [
  { id: 'flood_kids', emoji: '🌊', label: 'Flood Hero' },
  { id: 'earthquake_kids', emoji: '🏚️', label: 'Quake Hero' },
  { id: 'fire_kids', emoji: '🔥', label: 'Fire Hero' },
  { id: 'streak_7', emoji: '🔥', label: '7-Day Streak' },
  { id: 'rank_prepared', emoji: '🛡️', label: 'Prepared' }
];

const KID_QUESTS = [
  { hazard: 'flood', emoji: '🌊', title: 'Flood Rescue', color: '#38BDF8', desc: 'Beat the rising water!' },
  { hazard: 'earthquake', emoji: '🏚️', title: 'Quake Ready', color: '#F59E0B', desc: 'Stay safe when it shakes!' },
  { hazard: 'fire', emoji: '🔥', title: 'Fire Escape', color: '#EF4444', desc: 'Get out fast and stay low!' }
];

export default function HomeScreen({ navigation }) {
  const { userId, username } = useUser();
  const [profile, setProfile] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const profileResult = await apiRequest(`/onboarding/profile?userId=${userId}`, 'GET');
      setProfile(profileResult);
      const gamResult = await apiRequest('/gamification/login', 'POST', { userId });
      setGamification(gamResult);
      const alertsResult = await apiRequest(`/alerts/active?region=${profileResult.country || 'ALL'}`, 'GET');
      setAlerts(alertsResult.alerts);
    } catch (err) {
      console.log('Home load error:', err.message);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [userId]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!profile || !gamification) {
    return (
      <View style={[styles.center, { backgroundColor: '#F8FAFC' }]}>
        <Text style={{ color: '#64748B' }}>Loading...</Text>
      </View>
    );
  }

  const mode = profile.experienceMode || 'adult';
  const hasActiveAlert = alerts.length > 0;

  const AlertBanner = () =>
    hasActiveAlert ? (
      <TouchableOpacity style={styles.alertBanner} onPress={() => navigation.navigate('Alerts')}>
        <Text style={styles.alertBannerText}>
          ⚠️ {alerts[0].severity === 'critical' ? 'ACTIVE ALERT' : 'WEATHER ALERT'}: {alerts[0].message}
        </Text>
      </TouchableOpacity>
    ) : null;

  if (mode === 'child') {
    const xpInRank = gamification.points % 100;
    return (
      <ScrollView style={{ backgroundColor: '#FAF8F5' }} contentContainerStyle={styles.kidContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.kidHeader}>
          <View style={styles.kidHeaderTop}>
            <View>
              <Text style={styles.kidHello}>Hello, Safety Hero!</Text>
              <Text style={styles.kidName}>{profile.name || username} 🌟</Text>
            </View>
            <View style={styles.kidStreakPill}>
              <Text style={styles.kidStreakText}>🔥 {gamification.currentStreak} day streak!</Text>
            </View>
          </View>
          <View style={styles.kidRankCard}>
            <View style={styles.kidRankRow}>
              <Text style={styles.kidRankTitle}>🛡️ {gamification.rank}</Text>
              <Text style={styles.kidRankXp}>{gamification.points} XP</Text>
            </View>
            <View style={styles.kidXpBar}>
              <View style={[styles.kidXpFill, { width: `${Math.min(100, xpInRank)}%` }]} />
            </View>
            <Text style={styles.kidXpLabel}>{100 - xpInRank} XP until your next reward! 🚀</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeRow} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {KID_BADGES.map((badge) => {
            const earned = gamification.badges.includes(badge.id);
            return (
              <View key={badge.id} style={[styles.badgeChip, !earned && styles.badgeChipLocked]}>
                <Text style={styles.badgeEmoji}>{earned ? badge.emoji : '🔒'}</Text>
                <Text style={[styles.badgeLabel, !earned && styles.badgeLabelLocked]}>{badge.label}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.missionCard}>
          <Text style={styles.missionTag}>⭐ TODAY'S MISSION</Text>
          <Text style={styles.missionTitle}>Become a Safety Hero for every disaster!</Text>
          <View style={styles.missionRewards}>
            <View style={styles.rewardPill}><Text style={styles.rewardPillText}>+30 XP</Text></View>
            <View style={styles.rewardPill}><Text style={styles.rewardPillText}>🏅 Badges</Text></View>
          </View>
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>🎮 Safety Adventures</Text></View>

        {KID_QUESTS.map((quest) => (
          <TouchableOpacity key={quest.hazard} style={[styles.questCard, { backgroundColor: quest.color }]}
            onPress={() => navigation.navigate('KitBuilder', { hazard: quest.hazard })}>
            <Text style={styles.questEmoji}>{quest.emoji}</Text>
            <View style={styles.questInfo}>
              <Text style={styles.questTitle}>{quest.title}</Text>
              <Text style={styles.questSub}>{quest.desc}</Text>
              <Text style={styles.questMeta}>4 levels · Play now ▶</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>📖 Story Mode</Text></View>
        <TouchableOpacity style={styles.storyCard} onPress={() => navigation.navigate('Story')}>
          <Text style={styles.storyTag}>🌟 CHAPTER 1</Text>
          <Text style={styles.storyTitle}>Max & Mia and the Rising River — help them get ready! ⛈️</Text>
          <View style={styles.storyRow}>
            <View style={styles.storyButton}><Text style={styles.storyButtonText}>READ NOW ▶</Text></View>
            <Text style={styles.storyXp}>💰 +30 XP on complete</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.leaderboardCard} onPress={() => navigation.navigate('Leaderboard')}>
          <Text style={styles.leaderboardText}>🏆 Class Leaderboard</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (mode === 'teen') {
    return (
      <ScrollView style={{ backgroundColor: '#0F172A' }} contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F8FAFC" />}>
        <AlertBanner />
        <Text style={styles.teenGreeting}>Hey, {profile.name || username} 👋</Text>
        <Text style={styles.teenSub}>{gamification.rank} · {gamification.points} XP</Text>
        <View style={styles.teenStatsRow}>
          <View style={styles.teenStatBox}><Text style={styles.teenStatNumber}>{gamification.currentStreak}</Text><Text style={styles.teenStatLabel}>Day Streak</Text></View>
          <View style={styles.teenStatBox}><Text style={styles.teenStatNumber}>{gamification.badges.length}</Text><Text style={styles.teenStatLabel}>Badges</Text></View>
          <View style={styles.teenStatBox}><Text style={styles.teenStatNumber}>{gamification.longestStreak}</Text><Text style={styles.teenStatLabel}>Best Streak</Text></View>
        </View>
        <TouchableOpacity style={[styles.teenCta, { backgroundColor: '#0EA5E9' }]} onPress={() => navigation.navigate('LearningPath')}>
          <Text style={styles.teenCtaTitle}>📚 Preparedness Path</Text>
          <Text style={styles.teenCtaSub}>Lesson-by-lesson learning — unlock as you go</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.teenCta, { backgroundColor: '#FF6B6B' }]} onPress={() => navigation.navigate('Quiz')}>
          <Text style={styles.teenCtaTitle}>⚡ Start Drill</Text>
          <Text style={styles.teenCtaSub}>Adaptive quiz — difficulty scales with you</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.teenCard, { borderColor: '#0EA5E9' }]} onPress={() => navigation.navigate('KitBuilder', { hazard: 'flood' })}>
          <Text style={styles.teenCardText}>🎒 Kit Builder Challenge</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.teenCard, { borderColor: '#4F46E5' }]} onPress={() => navigation.navigate('Leaderboard')}>
          <Text style={styles.teenCardText}>🏆 Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.teenCard, { borderColor: '#0EA5E9' }]} onPress={() => navigation.navigate('Chatbot')}>
          <Text style={styles.teenCardText}>💬 Preparedness Assistant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.teenCard, { borderColor: '#F57C00' }]} onPress={() => navigation.navigate('Alerts')}>
          <Text style={styles.teenCardText}>🚨 Alerts Near You</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (mode === 'elderly') {
    return (
      <ScrollView style={{ backgroundColor: '#F8FAFC' }} contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <AlertBanner />
        <Text style={styles.seniorGreeting}>Good day,</Text>
        <Text style={styles.seniorName}>{profile.name || username} 👋</Text>
        <View style={styles.seniorScoreCard}>
          <Text style={styles.seniorScoreLabel}>Your progress</Text>
          <Text style={styles.seniorScoreText}>{gamification.points} points · {gamification.rank}</Text>
          <Text style={styles.seniorStreakText}>🌟 {gamification.currentStreak}-day learning streak</Text>
        </View>
        <TouchableOpacity style={[styles.seniorButton, { backgroundColor: '#1E3A8A' }]} onPress={() => navigation.navigate('Resources')}><Text style={styles.seniorButtonText}>📰 Read Articles</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.seniorButton, { backgroundColor: '#059669' }]} onPress={() => navigation.navigate('AudioPlayer')}><Text style={styles.seniorButtonText}>🎧 Listen & Learn</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.seniorButton, { backgroundColor: '#059669' }]} onPress={() => navigation.navigate('Quiz')}><Text style={styles.seniorButtonText}>🧠 Daily Quiz</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.seniorButton, { backgroundColor: '#1E3A8A' }]} onPress={() => navigation.navigate('Chatbot')}><Text style={styles.seniorButtonText}>💬 Ask a Question</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.seniorButton, { backgroundColor: '#D97706' }]} onPress={() => navigation.navigate('Alerts')}><Text style={styles.seniorButtonText}>🚨 Alerts Near You</Text></TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: '#F8FAFC' }} contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <AlertBanner />
      <Text style={styles.adultGreeting}>{profile.name || username}</Text>
      <Text style={styles.adultSub}>{gamification.rank} · {gamification.points} XP · {gamification.currentStreak}-day streak</Text>
      <Text style={styles.adultSectionTitle}>⚡ Your Preparedness</Text>
      <TouchableOpacity style={[styles.adultCard, { borderLeftColor: '#D97706' }]} onPress={() => navigation.navigate('Tasks')}><Text style={styles.adultCardTitle}>Daily Tasks</Text><Text style={styles.adultCardSub}>Complete today's preparedness action</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.adultCard, { borderLeftColor: '#1E3A8A' }]} onPress={() => navigation.navigate('Quiz')}><Text style={styles.adultCardTitle}>Adaptive Quiz</Text><Text style={styles.adultCardSub}>Scenario-based questions for your hazards: {(profile.relevantHazards || []).join(', ')}</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.adultCard, { borderLeftColor: '#059669' }]} onPress={() => navigation.navigate('KitBuilder', { hazard: 'flood' })}><Text style={styles.adultCardTitle}>Emergency Kit Builder</Text><Text style={styles.adultCardSub}>Build and check your household kit</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.adultCard, { borderLeftColor: '#1E3A8A' }]} onPress={() => navigation.navigate('Resources')}><Text style={styles.adultCardTitle}>Resource Hub</Text><Text style={styles.adultCardSub}>Guides and videos from official sources</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.adultCard, { borderLeftColor: '#D32F2F' }]} onPress={() => navigation.navigate('Alerts')}><Text style={styles.adultCardTitle}>Live Alerts</Text><Text style={styles.adultCardSub}>{hasActiveAlert ? `${alerts.length} active alert(s) in your area` : 'No active alerts in your area'}</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.adultCard, { borderLeftColor: '#059669' }]} onPress={() => navigation.navigate('Chatbot')}><Text style={styles.adultCardTitle}>Preparedness Assistant</Text><Text style={styles.adultCardSub}>Ask disaster-preparedness questions</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.adultCard, { borderLeftColor: '#4F46E5' }]} onPress={() => navigation.navigate('Leaderboard')}><Text style={styles.adultCardTitle}>Leaderboard</Text><Text style={styles.adultCardSub}>See how you rank</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, paddingBottom: 40 },
  alertBanner: { backgroundColor: EMERGENCY_COLORS.critical, borderRadius: 10, padding: 12, marginBottom: 16 },
  alertBannerText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  kidContainer: { paddingBottom: 40 },
  kidHeader: { backgroundColor: '#F59E0B', paddingTop: 16, paddingHorizontal: 16, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  kidHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  kidHello: { fontSize: 13, color: '#FFF3D6', fontWeight: 'bold' },
  kidName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  kidStreakPill: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  kidStreakText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  kidRankCard: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 14 },
  kidRankRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  kidRankTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  kidRankXp: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  kidXpBar: { height: 10, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  kidXpFill: { height: '100%', backgroundColor: '#fff', borderRadius: 5 },
  kidXpLabel: { color: '#FFF3D6', fontSize: 12, fontWeight: 'bold' },
  badgeRow: { marginTop: 16, marginBottom: 4 },
  badgeChip: { alignItems: 'center', backgroundColor: '#E8FBF3', borderRadius: 16, borderWidth: 2, borderColor: '#34D399', paddingVertical: 10, paddingHorizontal: 12, marginRight: 10, width: 84 },
  badgeChipLocked: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1', borderStyle: 'dashed' },
  badgeEmoji: { fontSize: 24 },
  badgeLabel: { fontSize: 10, fontWeight: 'bold', color: '#065F46', marginTop: 4, textAlign: 'center' },
  badgeLabelLocked: { color: '#94A3B8' },
  missionCard: { backgroundColor: '#38BDF8', borderRadius: 20, padding: 18, marginHorizontal: 16, marginTop: 16 },
  missionTag: { color: '#E0F2FE', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  missionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  missionRewards: { flexDirection: 'row' },
  rewardPill: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, marginRight: 8 },
  rewardPillText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  sectionHeader: { paddingHorizontal: 16, marginTop: 22, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
  questCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 18, marginHorizontal: 16, marginBottom: 12 },
  questEmoji: { fontSize: 44, marginRight: 16 },
  questInfo: { flex: 1 },
  questTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  questSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  questMeta: { fontSize: 12, color: '#fff', fontWeight: 'bold', marginTop: 8 },
  storyCard: { backgroundColor: '#6D5BD0', borderRadius: 20, padding: 18, marginHorizontal: 16 },
  storyTag: { color: '#DDD6FE', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6 },
  storyTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 14, lineHeight: 22 },
  storyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  storyButton: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18 },
  storyButtonText: { color: '#6D5BD0', fontWeight: 'bold', fontSize: 13 },
  storyXp: { color: '#DDD6FE', fontSize: 12, fontWeight: 'bold' },
  leaderboardCard: { backgroundColor: '#34D399', borderRadius: 20, padding: 18, marginHorizontal: 16, marginTop: 14, alignItems: 'center' },
  leaderboardText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  teenGreeting: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4 },
  teenSub: { fontSize: 14, color: '#94A3B8', marginBottom: 16 },
  teenStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  teenStatBox: { flex: 1, backgroundColor: '#1E293B', borderRadius: 14, padding: 14, marginHorizontal: 4, alignItems: 'center' },
  teenStatNumber: { fontSize: 22, fontWeight: 'bold', color: '#0EA5E9' },
  teenStatLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  teenCta: { borderRadius: 16, padding: 20, marginBottom: 16 },
  teenCtaTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  teenCtaSub: { fontSize: 13, color: '#FFE1E1', marginTop: 4 },
  teenCard: { backgroundColor: '#1E293B', borderRadius: 14, borderWidth: 1, padding: 18, marginBottom: 12 },
  teenCardText: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC' },
  seniorGreeting: { fontSize: 22, color: '#475569' },
  seniorName: { fontSize: 32, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  seniorScoreCard: { backgroundColor: '#E8F0FE', borderRadius: 16, padding: 20, marginBottom: 20 },
  seniorScoreLabel: { fontSize: 16, color: '#475569' },
  seniorScoreText: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 6 },
  seniorStreakText: { fontSize: 16, color: '#059669' },
  seniorButton: { borderRadius: 14, padding: 22, marginBottom: 14, alignItems: 'center' },
  seniorButtonText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  adultGreeting: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  adultSub: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  adultSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  adultCard: { backgroundColor: '#fff', borderRadius: 12, borderLeftWidth: 4, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  adultCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  adultCardSub: { fontSize: 13, color: '#64748B', marginTop: 4 }
});