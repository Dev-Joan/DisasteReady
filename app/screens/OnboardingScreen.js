import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';

export default function OnboardingScreen({ navigation }) {
  const { userId } = useUser();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [region, setRegion] = useState('');

  const handleComplete = async () => {
    if (!name || !age || !region) {
      Alert.alert('Missing info', 'Please fill in your name, age, and region.');
      return;
    }

    try {
      const result = await apiRequest('/onboarding/complete', 'POST', {
        userId,
        name,
        age: parseInt(age, 10),
        region,
        accessibilityFlags: []
      });

      navigation.navigate('Home');
    } catch (err) {
        Alert.alert('Onboarding failed', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tell us about you</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Region (e.g. UK, US, Japan)"
        value={region}
        onChangeText={setRegion}
      />

      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#c0392b', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});