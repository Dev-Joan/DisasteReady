import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FIRST_AID_CATEGORIES, FIRST_AID_GUIDES, EMERGENCY_DISCLAIMER } from '../constants/firstAid';

export default function FirstAidScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>First Aid</Text>
      <Text style={[styles.sub, { color: theme.textSub }]}>Quick, calm step-by-step guidance for emergencies.</Text>

      <View style={styles.disclaimerBox}>
        <MaterialCommunityIcons name="alert" size={18} color="#92400E" />
        <Text style={styles.disclaimerText}>{EMERGENCY_DISCLAIMER}</Text>
      </View>

      {FIRST_AID_CATEGORIES.map((cat) => (
        <View key={cat.key}>
          <View style={styles.catHeader}>
            <MaterialCommunityIcons name={cat.icon.name} size={22} color={theme.text} />
            <Text style={[styles.catTitle, { color: theme.text }]}>{cat.label}</Text>
          </View>
          {FIRST_AID_GUIDES.filter(g => g.category === cat.key).map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate('FirstAidGuide', { guideId: guide.id })}
            >
              <View style={[styles.iconCircle, { backgroundColor: guide.color + '1A' }]}>
                <MaterialCommunityIcons name={guide.icon.name} size={26} color={guide.color} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{guide.title}</Text>
                <Text style={[styles.cardSummary, { color: theme.textSub }]}>{guide.summary}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold' },
  sub: { fontSize: 14, marginBottom: 16 },
  disclaimerBox: { flexDirection: 'row', backgroundColor: '#FEF3C7', borderRadius: 12, borderWidth: 1, borderColor: '#F59E0B', padding: 12, marginBottom: 20, alignItems: 'flex-start' },
  disclaimerText: { fontSize: 12, color: '#92400E', lineHeight: 18, marginLeft: 8, flex: 1 },
  catHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 10 },
  catTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSummary: { fontSize: 12, marginTop: 3, lineHeight: 17 }
});
