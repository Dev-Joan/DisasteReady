import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import apiRequest from '../services/api';
import { useUser } from '../context/UserContext';
import { EMERGENCY_COLORS } from '../constants/colors';

const SEVERITY_STYLE = {
  critical: { color: EMERGENCY_COLORS.critical, label: 'CRITICAL ALERT' },
  warning: { color: EMERGENCY_COLORS.warning, label: 'WARNING' },
  advisory: { color: EMERGENCY_COLORS.advisory, label: 'ADVISORY' },
  safe: { color: EMERGENCY_COLORS.safe, label: 'ALL CLEAR' }
};

export default function AlertsScreen() {
  const { userId } = useUser();
  const [alerts, setAlerts] = useState([]);
  const [region, setRegion] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const profile = await apiRequest(`/onboarding/profile?userId=${userId}`, 'GET');
      const userRegion = profile.region || 'ALL';
      setRegion(userRegion);
      const result = await apiRequest(`/alerts/active?region=${userRegion}`, 'GET');
      setAlerts(result.alerts);
    } catch (err) {
      console.log('Alerts error:', err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F8FAFC" />}
    >
      <Text style={styles.title}>🚨 Alerts Near You</Text>
      <Text style={styles.subtitle}>Region: {region} · Simulated alert feed</Text>

      {alerts.map((alert) => {
        const sev = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.advisory;
        return (
          <View key={alert.alertId} style={[styles.alertCard, { borderLeftColor: sev.color }]}>
            <Text style={[styles.alertSeverity, { color: sev.color }]}>{sev.label}</Text>
            <Text style={styles.alertHazard}>{alert.hazard.toUpperCase()}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <Text style={styles.alertAdvice}>
              In a real emergency, always follow instructions from official emergency services.
            </Text>
          </View>
        );
      })}

      {alerts.length === 0 && (
        <View style={[styles.alertCard, { borderLeftColor: EMERGENCY_COLORS.safe }]}>
          <Text style={[styles.alertSeverity, { color: EMERGENCY_COLORS.safe }]}>ALL CLEAR</Text>
          <Text style={styles.alertMessage}>No active alerts in your area right now.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: EMERGENCY_COLORS.neutralDark },
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#F8FAFC' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginBottom: 20 },
  alertCard: {
    backgroundColor: '#27303F', borderRadius: 12, borderLeftWidth: 6, padding: 16, marginBottom: 14
  },
  alertSeverity: { fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  alertHazard: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  alertMessage: { fontSize: 16, color: '#F8FAFC', lineHeight: 22, marginBottom: 8 },
  alertAdvice: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }
});