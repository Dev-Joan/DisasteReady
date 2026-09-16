import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import apiRequest from '../services/api';
import { HAZARD_CATEGORIES, getArticlesByHazard } from '../constants/articles';

const VIDEOS = [
  { id: 'v1', title: 'Building Your 72-Hour Emergency Kit', source: 'FEMA', mins: '4:32', url: 'https://www.youtube.com/results?search_query=FEMA+emergency+kit' },
  { id: 'v2', title: 'Creating a Personal Evacuation Plan', source: 'Red Cross', mins: '6:10', url: 'https://www.youtube.com/results?search_query=red+cross+evacuation+plan' }
];

export default function ResourceHubScreen({ navigation }) {
  const { theme } = useTheme();
  const { userId } = useUser();
  const [isSenior, setIsSenior] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      apiRequest(`/onboarding/profile?userId=${userId}`, 'GET')
        .then((profile) => { if (active) setIsSenior(profile.experienceMode === 'elderly'); })
        .catch(() => {});
      return () => { active = false; };
    }, [userId])
  );

  const open = (url) => Linking.openURL(url).catch(() => {});

  const openArticle = (articleId) => {
    navigation.navigate(isSenior ? 'SeniorArticleReader' : 'ArticleReader', { articleId });
  };

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.text }, isSenior && styles.titleSenior]}>📚 Resource Hub</Text>
      <Text style={[styles.sub, { color: theme.textSub }, isSenior && styles.subSenior]}>Trusted preparedness guidance, organised by hazard.</Text>

      {HAZARD_CATEGORIES.map((cat) => (
        <View key={cat.key} style={{ marginBottom: 8 }}>
          <View style={styles.catHeader}>
            <MaterialCommunityIcons name={cat.icon} size={isSenior ? 26 : 22} color={cat.color} />
            <Text style={[styles.catTitle, { color: theme.text }, isSenior && styles.catTitleSenior]}>{cat.label}</Text>
          </View>
          {getArticlesByHazard(cat.key).map((article) => (
            <TouchableOpacity
              key={article.id}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: cat.color }]}
              onPress={() => openArticle(article.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }, isSenior && styles.cardTitleSenior]}>{article.title}</Text>
                <Text style={[styles.cardMeta, { color: theme.textSub }, isSenior && styles.cardMetaSenior]}>{article.mins} min read</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={isSenior ? 28 : 22} color={theme.textSub} />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Text style={[styles.section, { color: theme.text }, isSenior && styles.catTitleSenior]}>🎬 Videos</Text>
      {VIDEOS.map((v) => (
        <TouchableOpacity key={v.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => open(v.url)}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }, isSenior && styles.cardTitleSenior]}>▶ {v.title}</Text>
            <Text style={[styles.cardMeta, { color: theme.textSub }, isSenior && styles.cardMetaSenior]}>{v.source} · {v.mins}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.audioButton} onPress={() => navigation.navigate('AudioPlayer')}>
        <Text style={[styles.audioButtonText, isSenior && styles.audioButtonTextSenior]}>🎧 Listen & Learn (Audio Guides)</Text>
      </TouchableOpacity>

      <Text style={[styles.disclaimer, { color: theme.textSub }, isSenior && styles.disclaimerSenior]}>
        Always follow local emergency services in a real emergency.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold' },
  titleSenior: { fontSize: 30 },
  sub: { fontSize: 14, marginBottom: 20 },
  subSenior: { fontSize: 17, marginBottom: 24 },
  section: { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 10 },
  catHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 10 },
  catTitle: { fontSize: 17, fontWeight: 'bold', marginLeft: 8 },
  catTitleSenior: { fontSize: 20 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', lineHeight: 21 },
  cardTitleSenior: { fontSize: 18, lineHeight: 25 },
  cardMeta: { fontSize: 12, marginTop: 6 },
  cardMetaSenior: { fontSize: 15, marginTop: 8 },
  audioButton: { backgroundColor: '#059669', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  audioButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  audioButtonTextSenior: { fontSize: 19 },
  disclaimer: { fontSize: 11, marginTop: 20, textAlign: 'center', lineHeight: 16 },
  disclaimerSenior: { fontSize: 14, lineHeight: 20 }
});
