import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { getArticleById, HAZARD_CATEGORIES } from '../constants/articles';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SECTIONS = [
  { key: 'whatItIs', label: 'What It Is', color: '#64748B' },
  { key: 'before', label: 'Before: How to Prepare', color: '#059669' },
  { key: 'during', label: 'During: What to Do', color: '#D32F2F' },
  { key: 'after', label: 'After: What to Do', color: '#D97706' }
];

export default function SeniorArticleReaderScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { articleId } = route.params;
  const article = getArticleById(articleId);
  const category = HAZARD_CATEGORIES.find(c => c.key === article?.hazard);

  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const OFFSET = SCREEN_WIDTH * 0.3;

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }]
  }));

  // direction: 1 = advancing to next section, -1 = going back to previous section
  const enterFrom = (direction) => {
    translateX.value = direction * OFFSET;
    translateX.value = withTiming(0, { duration: 240, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(1, { duration: 240 });
  };

  const transitionTo = (nextIndex, direction) => {
    opacity.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) });
    translateX.value = withTiming(-direction * OFFSET, { duration: 180, easing: Easing.in(Easing.quad) }, (done) => {
      if (done) {
        runOnJS(setIndex)(nextIndex);
        runOnJS(enterFrom)(direction);
      }
    });
  };

  const goNext = () => {
    if (index < SECTIONS.length - 1) {
      transitionTo(index + 1, 1);
    } else {
      setFinished(true);
    }
  };

  const goPrev = () => {
    if (index > 0) transitionTo(index - 1, -1);
  };

  if (!article) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={[styles.notFoundText, { color: theme.text }]}>Article not found.</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg, padding: 28 }]}>
        <MaterialCommunityIcons name="check-circle" size={72} color="#059669" />
        <Text style={[styles.finishedTitle, { color: theme.text }]}>Article Complete</Text>
        <Text style={[styles.finishedSub, { color: theme.textSub }]}>You've read all four parts of "{article.title}".</Text>
        <TouchableOpacity style={styles.bigButton} onPress={() => navigation.goBack()}>
          <Text style={styles.bigButtonText}>BACK TO ARTICLES</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const section = SECTIONS[index];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={28} color={theme.textSub} />
        </TouchableOpacity>
        <Text style={[styles.hazardLabel, { color: category?.color || '#1E3A8A' }]}>{category?.label?.toUpperCase() || 'PREPAREDNESS'}</Text>
        <Text style={[styles.title, { color: theme.text }]}>{article.title}</Text>

        <View style={styles.dotsRow}>
          {SECTIONS.map((s, i) => (
            <View
              key={s.key}
              style={[
                styles.dot,
                { backgroundColor: i <= index ? (category?.color || '#1E3A8A') : theme.border }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.stepLabel, { color: theme.textSub }]}>Step {index + 1} of {SECTIONS.length}</Text>
      </View>

      <View style={styles.bodyWrap}>
        <Animated.View style={[styles.card, { backgroundColor: theme.card, borderColor: section.color }, contentStyle]}>
          <Text style={[styles.sectionLabel, { color: section.color }]}>{section.label.toUpperCase()}</Text>
          <Text style={[styles.sectionText, { color: theme.text }]}>{article.sections[section.key]}</Text>
        </Animated.View>
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary, { borderColor: theme.border }, index === 0 && styles.navButtonDisabled]}
          disabled={index === 0}
          onPress={goPrev}
        >
          <Text style={[styles.navButtonSecondaryText, { color: index === 0 ? theme.textSub : theme.text }]}>◀ BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary, { backgroundColor: category?.color || '#1E3A8A' }]} onPress={goNext}>
          <Text style={styles.navButtonPrimaryText}>{index === SECTIONS.length - 1 ? 'FINISH' : 'NEXT ▶'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 22 },

  header: { paddingTop: 20, paddingHorizontal: 24, paddingBottom: 12 },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 8, padding: 4 },
  hazardLabel: { fontSize: 15, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6 },
  title: { fontSize: 30, fontWeight: 'bold', lineHeight: 38, marginBottom: 18 },
  dotsRow: { flexDirection: 'row', marginBottom: 10 },
  dot: { width: 44, height: 10, borderRadius: 5, marginRight: 8 },
  stepLabel: { fontSize: 16, fontWeight: '600' },

  bodyWrap: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  card: { borderRadius: 20, borderWidth: 2, padding: 24 },
  sectionLabel: { fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 16 },
  sectionText: { fontSize: 22, lineHeight: 34 },

  navRow: { flexDirection: 'row', padding: 24, paddingTop: 12 },
  navButton: { flex: 1, borderRadius: 16, paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  navButtonSecondary: { borderWidth: 2, marginRight: 12 },
  navButtonSecondaryText: { fontSize: 18, fontWeight: 'bold' },
  navButtonDisabled: { opacity: 0.4 },
  navButtonPrimary: { flex: 1.4 },
  navButtonPrimaryText: { fontSize: 18, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },

  bigButton: { backgroundColor: '#1E3A8A', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 40, marginTop: 28 },
  bigButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
  finishedTitle: { fontSize: 26, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
  finishedSub: { fontSize: 17, textAlign: 'center', marginTop: 10, lineHeight: 24 }
});
