import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ARTICLES = [
  { id: 'a1', title: '10 Things Every Home Should Have in an Emergency Kit', source: 'Red Cross', mins: 5, url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/survival-kit-supplies.html' },
  { id: 'a2', title: 'How to Make a Family Emergency Plan', source: 'Ready.gov', mins: 6, url: 'https://www.ready.gov/plan' },
  { id: 'a3', title: 'Flood Safety: Before, During and After', source: 'Red Cross', mins: 7, url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/flood.html' },
  { id: 'a4', title: 'Earthquake Safety at Home', source: 'Ready.gov', mins: 5, url: 'https://www.ready.gov/earthquakes' }
];

const VIDEOS = [
  { id: 'v1', title: 'Building Your 72-Hour Emergency Kit', source: 'FEMA', mins: '4:32', url: 'https://www.youtube.com/results?search_query=FEMA+emergency+kit' },
  { id: 'v2', title: 'Creating a Personal Evacuation Plan', source: 'Red Cross', mins: '6:10', url: 'https://www.youtube.com/results?search_query=red+cross+evacuation+plan' }
];

export default function ResourceHubScreen({ navigation }) {
  const { theme } = useTheme();

  const open = (url) => Linking.openURL(url).catch(() => {});

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>📚 Resource Hub</Text>
      <Text style={[styles.sub, { color: theme.textSub }]}>Trusted guidance from official sources.</Text>

      <Text style={[styles.section, { color: theme.text }]}>📰 Articles</Text>
      {ARTICLES.map((a) => (
        <TouchableOpacity key={a.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => open(a.url)}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{a.title}</Text>
          <Text style={[styles.cardMeta, { color: theme.textSub }]}>{a.source} · {a.mins} min read →</Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.section, { color: theme.text }]}>🎬 Videos</Text>
      {VIDEOS.map((v) => (
        <TouchableOpacity key={v.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => open(v.url)}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>▶ {v.title}</Text>
          <Text style={[styles.cardMeta, { color: theme.textSub }]}>{v.source} · {v.mins}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[styles.audioButton]} onPress={() => navigation.navigate('AudioPlayer')}>
        <Text style={styles.audioButtonText}>🎧 Listen & Learn (Audio Guides)</Text>
      </TouchableOpacity>

      <Text style={[styles.disclaimer, { color: theme.textSub }]}>
        Links open official external websites. Always follow local emergency services in a real emergency.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold' },
  sub: { fontSize: 14, marginBottom: 20 },
  section: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', lineHeight: 21 },
  cardMeta: { fontSize: 12, marginTop: 6 },
  audioButton: { backgroundColor: '#059669', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 20 },
  audioButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  disclaimer: { fontSize: 11, marginTop: 20, textAlign: 'center', lineHeight: 16 }
});