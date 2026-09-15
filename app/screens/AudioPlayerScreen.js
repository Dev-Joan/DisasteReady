import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useTheme } from '../context/ThemeContext';

const EPISODES = [
  { id: 'e1', title: 'What to Put in Your Emergency Kit', desc: 'A calm guide to the essentials every home needs.', source: 'DisasterReady Audio', file: require('../assets/sounds/audio_kit.wav') },
  { id: 'e2', title: 'Planning Your Evacuation Route', desc: 'How to plan where to go before an emergency happens.', source: 'DisasterReady Audio', file: require('../assets/sounds/audio_evac.wav') }
];

export default function AudioPlayerScreen() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState(EPISODES[0]);
  const player = useAudioPlayer(selected.file);
  const status = useAudioPlayerStatus(player);

  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(false);
    player.pause();
    player.seekTo(0);
  }, [selected]);

  const togglePlay = () => {
    if (playing) {
      player.pause();
      setPlaying(false);
    } else {
      player.play();
      setPlaying(true);
    }
  };

  const restart = () => {
    player.seekTo(0);
    player.play();
    setPlaying(true);
  };

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>🎧 Listen & Learn</Text>
      <Text style={[styles.sub, { color: theme.textSub }]}>Audio guides you can listen to anytime.</Text>

      <View style={[styles.nowPlaying, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.npLabel, { color: theme.textSub }]}>NOW PLAYING</Text>
        <Text style={[styles.npTitle, { color: theme.text }]}>{selected.title}</Text>
        <Text style={[styles.npDesc, { color: theme.textSub }]}>{selected.desc}</Text>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.ctrlSmall} onPress={restart}>
            <Text style={styles.ctrlSmallText}>⏮</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBig} onPress={togglePlay}>
            <Text style={styles.ctrlBigText}>{playing ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <View style={styles.ctrlSmall} />
        </View>
      </View>

      <Text style={[styles.section, { color: theme.text }]}>All Episodes</Text>
      {EPISODES.map((ep) => (
        <TouchableOpacity
          key={ep.id}
          style={[styles.epCard, { backgroundColor: theme.card, borderColor: selected.id === ep.id ? '#059669' : theme.border }]}
          onPress={() => setSelected(ep)}
        >
          <Text style={styles.epIcon}>{selected.id === ep.id && playing ? '🔊' : '🎵'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.epTitle, { color: theme.text }]}>{ep.title}</Text>
            <Text style={[styles.epSource, { color: theme.textSub }]}>{ep.source}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold' },
  sub: { fontSize: 15, marginBottom: 20 },
  nowPlaying: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center' },
  npLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  npTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  npDesc: { fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  controls: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  ctrlSmall: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  ctrlSmallText: { fontSize: 30 },
  ctrlBig: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16 },
  ctrlBigText: { fontSize: 38, color: '#fff' },
  section: { fontSize: 18, fontWeight: 'bold', marginTop: 28, marginBottom: 12 },
  epCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 2, padding: 16, marginBottom: 12 },
  epIcon: { fontSize: 28, marginRight: 14 },
  epTitle: { fontSize: 16, fontWeight: 'bold' },
  epSource: { fontSize: 12, marginTop: 2 }
});