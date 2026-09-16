import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getArticleById, HAZARD_CATEGORIES } from '../constants/articles';

const SECTIONS = [
  { key: 'whatItIs', label: 'WHAT IT IS', color: '#64748B' },
  { key: 'before', label: 'BEFORE: HOW TO PREPARE', color: '#059669' },
  { key: 'during', label: 'DURING: WHAT TO DO', color: '#D32F2F' },
  { key: 'after', label: 'AFTER: WHAT TO DO', color: '#D97706' }
];

export default function ArticleReaderScreen({ route }) {
  const { theme } = useTheme();
  const { articleId } = route.params;
  const article = getArticleById(articleId);
  const category = HAZARD_CATEGORIES.find(c => c.key === article?.hazard);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(1);
  const [viewportHeight, setViewportHeight] = useState(1);

  if (!article) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>Article not found.</Text>
      </View>
    );
  }

  const maxScroll = Math.max(1, contentHeight - viewportHeight);
  const progressWidth = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp'
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: category?.color || '#1E3A8A' }]} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.container}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
      >
        <View style={[styles.iconCircle, { backgroundColor: (category?.color || '#1E3A8A') + '1A' }]}>
          <MaterialCommunityIcons name={category?.icon || 'book-open-page-variant'} size={40} color={category?.color || '#1E3A8A'} />
        </View>
        <Text style={[styles.hazardLabel, { color: category?.color || '#1E3A8A' }]}>{category?.label?.toUpperCase() || 'PREPAREDNESS'}</Text>
        <Text style={[styles.title, { color: theme.text }]}>{article.title}</Text>
        <Text style={[styles.meta, { color: theme.textSub }]}>{article.mins} min read</Text>

        {SECTIONS.map((s) => (
          <View key={s.key} style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: s.color }]}>
            <Text style={[styles.sectionLabel, { color: s.color }]}>{s.label}</Text>
            <Text style={[styles.sectionText, { color: theme.text }]}>{article.sections[s.key]}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progressTrack: { height: 4, width: '100%' },
  progressFill: { height: '100%' },
  container: { padding: 20, paddingBottom: 48 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 8, marginBottom: 12 },
  hazardLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center', marginBottom: 6 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  meta: { fontSize: 13, textAlign: 'center', marginBottom: 22 },
  section: { borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, padding: 16, marginBottom: 14 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  sectionText: { fontSize: 15, lineHeight: 23 }
});
