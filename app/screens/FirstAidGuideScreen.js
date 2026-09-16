import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FIRST_AID_GUIDES, EMERGENCY_DISCLAIMER } from '../constants/firstAid';

export default function FirstAidGuideScreen({ route }) {
  const { theme } = useTheme();
  const { guideId } = route.params;
  const guide = FIRST_AID_GUIDES.find(g => g.id === guideId);

  if (!guide) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>Guide not found.</Text>
      </View>
    );
  }

  const openVideo = () => {
    if (guide.video) Linking.openURL(guide.video.url).catch(() => {});
  };

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: guide.color + '1A' }]}>
        <MaterialCommunityIcons name={guide.icon.name} size={48} color={guide.color} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{guide.title}</Text>
      <Text style={[styles.summary, { color: theme.textSub }]}>{guide.summary}</Text>

      <View style={styles.callBox}>
        <MaterialCommunityIcons name="phone" size={18} color="#991B1B" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.callTitle}>Call first</Text>
          <Text style={styles.callText}>{guide.callFirst}</Text>
        </View>
      </View>

      {guide.video && (
        <TouchableOpacity style={styles.videoBtn} onPress={openVideo}>
          <MaterialCommunityIcons name="play-circle" size={20} color="#fff" />
          <Text style={styles.videoBtnText}>{guide.video.label}</Text>
        </TouchableOpacity>
      )}

      {guide.steps.map((step, i) => (
        <View key={i} style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{i + 1}</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
            <Text style={[styles.stepText, { color: theme.textSub }]}>{step.text}</Text>
          </View>
        </View>
      ))}

      <View style={styles.disclaimerBox}>
        <MaterialCommunityIcons name="alert" size={18} color="#92400E" />
        <Text style={styles.disclaimerText}>{EMERGENCY_DISCLAIMER}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, paddingBottom: 40, alignItems: 'stretch' },
  iconCircle: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  summary: { fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 20, lineHeight: 20 },
  callBox: { flexDirection: 'row', backgroundColor: '#FEE2E2', borderRadius: 12, borderWidth: 1, borderColor: '#D32F2F', padding: 14, marginBottom: 16, alignItems: 'flex-start' },
  callTitle: { fontSize: 14, fontWeight: 'bold', color: '#991B1B', marginBottom: 4 },
  callText: { fontSize: 13, color: '#991B1B', lineHeight: 19 },
  videoBtn: { flexDirection: 'row', backgroundColor: '#1E3A8A', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  videoBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  stepCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  stepNumberText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  stepText: { fontSize: 14, lineHeight: 21 },
  disclaimerBox: { flexDirection: 'row', backgroundColor: '#FEF3C7', borderRadius: 12, borderWidth: 1, borderColor: '#F59E0B', padding: 12, marginTop: 8, alignItems: 'flex-start' },
  disclaimerText: { fontSize: 12, color: '#92400E', lineHeight: 18, marginLeft: 8, flex: 1 }
});
