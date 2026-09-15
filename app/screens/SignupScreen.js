import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';

const AGE_TILES = [
  { key: 'child', label: 'Kids', ages: 'Ages 5-12', tags: 'Games · Learn', color: '#FFB70D', min: 5, max: 12 },
  { key: 'teen', label: 'Teens', ages: 'Ages 13-24', tags: 'Streaks · XP', color: '#0EA5E9', min: 13, max: 24 },
  { key: 'adult', label: 'Adults', ages: 'Ages 25-49', tags: 'Guides · Ranks', color: '#4F46E5', min: 25, max: 49 },
  { key: 'elderly', label: 'Seniors', ages: 'Ages 50+', tags: 'Audio · Articles', color: '#34D399', min: 50, max: 200 }
];

const REGION_COUNTRIES = {
  'MEA': ['Lebanon', 'UAE', 'Saudi Arabia', 'Egypt', 'South Africa'],
  'Europe': ['UK', 'France', 'Germany', 'Italy', 'Greece'],
  'Asia': ['Japan', 'India', 'Philippines', 'Indonesia', 'China'],
  'Americas': ['US', 'Canada', 'Mexico', 'Brazil', 'Argentina']
};

const ACCESSIBILITY_OPTIONS = [
  { key: 'visual', label: 'Visual' },
  { key: 'hearing', label: 'Hearing' },
  { key: 'motor', label: 'Motor' },
  { key: 'cognitive', label: 'Cognitive' }
];

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [region, setRegion] = useState(null);
  const [country, setCountry] = useState(null);
  const [accessibilityFlags, setAccessibilityFlags] = useState([]);
  const { setUserId, setUsername: setContextUsername } = useUser();

  const ageNum = parseInt(age, 10);
  const activeTile = AGE_TILES.find(t => ageNum >= t.min && ageNum <= t.max);

  const toggleFlag = (key) => {
    setAccessibilityFlags((prev) =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const selectRegion = (r) => {
    setRegion(r);
    setCountry(null);
  };

  const handleSignup = async () => {
    if (!username || !password || !name || !age || !region || !country) {
      Alert.alert('Missing info', 'Please fill in all fields including region and country.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    if (isNaN(ageNum) || ageNum < 5) {
      Alert.alert('Invalid age', 'Please enter a valid age (5 or older).');
      return;
    }

    try {
      const result = await apiRequest('/auth/signup', 'POST', {
        username, password, name, age: ageNum, region, country, accessibilityFlags
      });
      setUserId(result.userId);
      setContextUsername(result.username);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      Alert.alert('Signup failed', err.message);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} />
      <Text style={styles.appName}>DisasterReady</Text>
      <Text style={styles.tagline}>Create your account</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#64748B"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor="#64748B"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Your age"
          placeholderTextColor="#64748B"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.sectionLabel}>YOUR AGE GROUP</Text>
      <View style={styles.tileGrid}>
        {AGE_TILES.map((tile) => {
          const isActive = activeTile && activeTile.key === tile.key;
          return (
            <View
              key={tile.key}
              style={[
                styles.tile,
                { borderColor: isActive ? tile.color : '#334155' },
                isActive && { backgroundColor: '#1E293B' }
              ]}
            >
              <Text style={[styles.tileLabel, { color: isActive ? tile.color : '#64748B' }]}>{tile.label}</Text>
              <Text style={styles.tileAges}>{tile.ages}</Text>
              <Text style={styles.tileTags}>{tile.tags}</Text>
              {isActive && <Text style={[styles.tileActive, { color: tile.color }]}>✓ That's you</Text>}
            </View>
          );
        })}
      </View>
      <Text style={styles.tileNote}>Enter your age above and your experience is set automatically.</Text>

      <Text style={styles.sectionLabel}>YOUR REGION</Text>
      <View style={styles.regionRow}>
        {Object.keys(REGION_COUNTRIES).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.regionChip, region === r && styles.regionChipActive]}
            onPress={() => selectRegion(r)}
          >
            <Text style={[styles.regionChipText, region === r && styles.regionChipTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {region && (
        <>
          <Text style={styles.sectionLabel}>YOUR COUNTRY</Text>
          <View style={styles.regionRow}>
            {REGION_COUNTRIES[region].map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.regionChip, country === c && styles.regionChipActive]}
                onPress={() => setCountry(c)}
              >
                <Text style={[styles.regionChipText, country === c && styles.regionChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionLabel}>ACCESSIBILITY (OPTIONAL)</Text>
      <Text style={styles.accessNote}>Used only to adjust how the app looks and works for you.</Text>
      <View style={styles.regionRow}>
        {ACCESSIBILITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.regionChip, accessibilityFlags.includes(opt.key) && styles.regionChipActive]}
            onPress={() => toggleFlag(opt.key)}
          >
            <Text style={[styles.regionChipText, accessibilityFlags.includes(opt.key) && styles.regionChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Create Account & Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>
          Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
        </Text>
      </TouchableOpacity>

      <Text style={styles.privacyNote}>
        Your data stays on this app's own server and is used only to personalise your experience. No data is shared with third parties.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F172A' },
  container: { padding: 24, alignItems: 'center' },
  logo: { width: 90, height: 90, marginTop: 16, marginBottom: 10, borderRadius: 20 },
  appName: { fontSize: 26, fontWeight: 'bold', color: '#F8FAFC' },
  tagline: { fontSize: 14, color: '#94A3B8', marginBottom: 20 },
  card: { width: '100%', backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 20 },
  input: {
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10,
    padding: 14, marginBottom: 12, color: '#F8FAFC'
  },
  sectionLabel: { fontSize: 12, color: '#64748B', letterSpacing: 1, marginBottom: 10, alignSelf: 'flex-start' },
  tileGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    width: '48%', backgroundColor: '#141F35', borderRadius: 16, borderWidth: 2,
    padding: 14, marginBottom: 12, alignItems: 'center'
  },
  tileLabel: { fontSize: 17, fontWeight: 'bold' },
  tileAges: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  tileTags: { fontSize: 11, color: '#64748B', marginTop: 4 },
  tileActive: { fontSize: 12, fontWeight: 'bold', marginTop: 6 },
  tileNote: { fontSize: 11, color: '#64748B', marginBottom: 16, textAlign: 'center' },
  regionRow: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  regionChip: {
    borderWidth: 1, borderColor: '#334155', borderRadius: 20, paddingVertical: 8,
    paddingHorizontal: 16, marginRight: 8, marginBottom: 8
  },
  regionChipActive: { backgroundColor: '#F57C00', borderColor: '#F57C00' },
  regionChipText: { color: '#94A3B8', fontWeight: 'bold' },
  regionChipTextActive: { color: '#fff' },
  accessNote: { fontSize: 11, color: '#64748B', alignSelf: 'flex-start', marginBottom: 8 },
  signupButton: {
    width: '100%', backgroundColor: '#F57C00', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 16, marginTop: 8
  },
  signupButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loginLink: { color: '#94A3B8', fontSize: 14, marginBottom: 16 },
  loginLinkBold: { color: '#F57C00', fontWeight: 'bold' },
  privacyNote: { fontSize: 11, color: '#475569', textAlign: 'center', lineHeight: 16, marginBottom: 24 }
});