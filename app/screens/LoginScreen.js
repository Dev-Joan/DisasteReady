import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUserId, setUsername: setContextUsername } = useUser();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Missing info', 'Please enter both username and password.');
      return;
    }

    try {
      const result = await apiRequest('/auth/login', 'POST', { username, password });
      setUserId(result.userId);
      setContextUsername(result.username);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      Alert.alert('Login failed', err.message);
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert('Not available', `${provider} sign-in is not available in this prototype. Please use username and password.`);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} />
      <Text style={styles.appName}>DisasterReady</Text>
      <Text style={styles.tagline}>Your Disaster Preparedness Companion</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>

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
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Sign In & Continue</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or continue with</Text>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
          <Text style={styles.socialButtonText}>Apple</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signupLink}>
          New to DisasterReady? <Text style={styles.signupLinkBold}>Create Account</Text>
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
  logo: { width: 110, height: 110, marginTop: 24, marginBottom: 12, borderRadius: 24 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC' },
  tagline: { fontSize: 14, color: '#94A3B8', marginBottom: 24 },
  card: { width: '100%', backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 16 },
  input: {
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10,
    padding: 14, marginBottom: 12, color: '#F8FAFC'
  },
  loginButton: {
    width: '100%', backgroundColor: '#F57C00', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 16
  },
  loginButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  orText: { color: '#64748B', fontSize: 13, marginBottom: 12 },
  socialRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 20 },
  socialButton: { width: '48%', backgroundColor: '#1E293B', borderRadius: 10, padding: 14, alignItems: 'center' },
  socialButtonText: { color: '#F8FAFC', fontWeight: 'bold' },
  signupLink: { color: '#94A3B8', fontSize: 14, marginBottom: 16 },
  signupLinkBold: { color: '#F57C00', fontWeight: 'bold' },
  privacyNote: { fontSize: 11, color: '#475569', textAlign: 'center', lineHeight: 16, marginBottom: 24 }
});