import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import apiRequest from '../services/api';

export default function ChatbotScreen() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setConversation((prev) => [...prev, { role: 'user', text: userMessage }]);
    setMessage('');
    setLoading(true);

    try {
      const result = await apiRequest('/chatbot/ask', 'POST', { message: userMessage });
      setConversation((prev) => [...prev, { role: 'bot', text: result.reply }]);
    } catch (err) {
      setConversation((prev) => [...prev, { role: 'bot', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messages} contentContainerStyle={{ padding: 16 }}>
        {conversation.map((entry, index) => (
          <View
            key={index}
            style={[styles.bubble, entry.role === 'user' ? styles.userBubble : styles.botBubble]}
          >
            <Text style={entry.role === 'user' ? styles.userText : styles.botText}>{entry.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about disaster preparedness..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messages: { flex: 1 },
  bubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '80%' },
  userBubble: { backgroundColor: '#c0392b', alignSelf: 'flex-end' },
  botBubble: { backgroundColor: '#eee', alignSelf: 'flex-start' },
  userText: { color: '#fff' },
  botText: { color: '#000' },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8 },
  sendButton: { backgroundColor: '#c0392b', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' }
});