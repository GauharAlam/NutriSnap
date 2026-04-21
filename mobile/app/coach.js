import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../lib/api';
import { Colors, Fonts, Radius } from '../lib/colors';

export default function CoachScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your AI Fitness Coach. I can help you build workout plans, give nutrition advice, or analyze your daily stats. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  async function handleSend() {
    const msg = inputValue.trim();
    if (!msg || isTyping) return;

    setInputValue('');

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', text: msg },
    ]);
    setIsTyping(true);

    try {
      const response = await apiClient.post('/assistant', { message: msg });
      const replyText = response.data?.data?.reply || "I'm having trouble connecting right now.";

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}_ai`, role: 'assistant', text: replyText },
      ]);
    } catch (error) {
      console.log('AI Chat error:', error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}_err`,
          role: 'assistant',
          text: 'Something went wrong on my end! Please try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function renderMessage({ item }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={{ fontSize: 14 }}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textSec} />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <LinearGradient
              colors={Colors.gradientBlue}
              style={styles.headerAvatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={{ fontSize: 16 }}>🤖</Text>
            </LinearGradient>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerTitle}>NutriSnap AI</Text>
            <Text style={styles.headerSub}>FITNESS COACH</Text>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.msgRow}>
                <View style={styles.botAvatar}>
                  <Text style={{ fontSize: 14 }}>🤖</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                  <View style={styles.typingDots}>
                    {[0, 1, 2].map((i) => (
                      <View key={i} style={[styles.typingDot, { opacity: 0.3 + i * 0.25 }]} />
                    ))}
                  </View>
                </View>
              </View>
            ) : null
          }
        />

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Ask your coach anything..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={1000}
              editable={!isTyping}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputValue.trim() || isTyping}
              style={[
                styles.sendBtn,
                (!inputValue.trim() || isTyping) && styles.sendBtnDisabled,
              ]}
            >
              <Ionicons
                name="send"
                size={18}
                color={(!inputValue.trim() || isTyping) ? Colors.textMuted : Colors.textDark}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: 'rgba(8,8,15,0.95)',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { position: 'relative' },
  headerAvatarGradient: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.neonGreen, borderWidth: 2, borderColor: Colors.bg,
  },
  headerTitle: { fontSize: 14, color: Colors.text, ...Fonts.bold },
  headerSub: { fontSize: 10, color: Colors.neonBlue, ...Fonts.medium, letterSpacing: 1.2 },

  // Chat
  chatList: { padding: 16, gap: 12, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  botAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  bubble: { maxWidth: '80%', borderRadius: 20, padding: 14 },
  bubbleUser: {
    backgroundColor: Colors.neonBlue, borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: Colors.bgCardSolid, borderWidth: 1,
    borderColor: Colors.border, borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, color: Colors.textSec, lineHeight: 20 },
  bubbleTextUser: { color: Colors.textDark, ...Fonts.medium },

  // Typing
  typingBubble: { paddingVertical: 16, paddingHorizontal: 20 },
  typingDots: { flexDirection: 'row', gap: 4 },
  typingDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.textSec,
  },

  // Input
  inputArea: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.bg, paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgInput, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.borderLight,
    paddingLeft: 18, paddingRight: 6, paddingVertical: 4,
  },
  input: {
    flex: 1, fontSize: 14, color: Colors.text,
    maxHeight: 100, paddingVertical: 10,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.neonBlue,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.bgInput,
  },
});
