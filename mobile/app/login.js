import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../lib/auth-context';
import { Colors, Fonts, Radius } from '../lib/colors';

const goalOptions = [
  { value: 'weight_loss', label: 'Weight Loss', icon: '🔥' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
  { value: 'maintenance', label: 'Maintenance', icon: '⚡' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', goalType: 'maintenance',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isBootstrapping]);

  async function handleSubmit() {
    setError('');
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(loginForm);
      } else {
        await register(registerForm);
      }
      router.replace('/(tabs)');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeForm = mode === 'login' ? loginForm : registerForm;
  const setField = (field, value) => {
    if (mode === 'login') {
      setLoginForm((p) => ({ ...p, [field]: value }));
    } else {
      setRegisterForm((p) => ({ ...p, [field]: value }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background glow */}
        <View style={styles.glowOrb} />

        {/* Logo */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={Colors.gradientBlue}
            style={styles.logoBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoIcon}>⚡</Text>
          </LinearGradient>
          <Text style={styles.title}>
            Nutri<Text style={{ color: Colors.neonBlue }}>Snap</Text>
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'login' ? 'Welcome back, warrior' : 'Start your fitness journey'}
          </Text>
        </View>

        {/* Mode Switch */}
        <View style={styles.tabContainer}>
          {[['login', 'Sign In'], ['register', 'Sign Up']].map(([val, label]) => (
            <Pressable
              key={val}
              style={styles.tabBtn}
              onPress={() => { setMode(val); setError(''); }}
            >
              {mode === val ? (
                <LinearGradient
                  colors={Colors.gradientBlue}
                  style={styles.tabActive}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.tabActiveText}>{label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={styles.tabInactiveText}>{label}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textMuted}
                value={registerForm.name}
                onChangeText={(v) => setField('name', v)}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              value={activeForm.email}
              onChangeText={(v) => setField('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor={Colors.textMuted}
              value={activeForm.password}
              onChangeText={(v) => setField('password', v)}
              secureTextEntry
            />
          </View>

          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>FITNESS GOAL</Text>
              <View style={styles.goalRow}>
                {goalOptions.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setRegisterForm((p) => ({ ...p, goalType: opt.value }))}
                    style={[
                      styles.goalBtn,
                      registerForm.goalType === opt.value && styles.goalBtnActive,
                    ]}
                  >
                    <Text style={styles.goalIcon}>{opt.icon}</Text>
                    <Text
                      style={[
                        styles.goalLabel,
                        registerForm.goalType === opt.value && styles.goalLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <LinearGradient
              colors={isSubmitting ? ['#555', '#444'] : Colors.gradientBlue}
              style={styles.submitBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  glowOrb: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(0,212,255,0.06)',
  },
  logoSection: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: { fontSize: 26 },
  title: { fontSize: 30, color: Colors.text, ...Fonts.display },
  subtitle: { fontSize: 14, color: Colors.textSec, marginTop: 4, ...Fonts.medium },

  // Tab switch
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCardSolid,
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: { flex: 1 },
  tabActive: {
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  tabActiveText: { color: '#fff', fontSize: 14, ...Fonts.semibold },
  tabInactive: {
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  tabInactiveText: { color: Colors.textSec, fontSize: 14, ...Fonts.medium },

  // Form card
  formCard: {
    backgroundColor: Colors.bgCardSolid,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    gap: 16,
  },
  fieldGroup: { gap: 8 },
  label: {
    fontSize: 10,
    color: Colors.textSec,
    ...Fonts.semibold,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    ...Fonts.regular,
  },
  goalRow: { flexDirection: 'row', gap: 8 },
  goalBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
  },
  goalBtnActive: {
    borderColor: 'rgba(0,212,255,0.4)',
    backgroundColor: 'rgba(0,212,255,0.08)',
  },
  goalIcon: { fontSize: 20 },
  goalLabel: { fontSize: 11, color: Colors.textSec, ...Fonts.medium },
  goalLabelActive: { color: Colors.neonBlue },

  // Error
  errorBox: {
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    padding: 14,
  },
  errorText: { fontSize: 13, color: Colors.error, ...Fonts.medium },

  // Submit button
  submitBtn: {
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontSize: 15, ...Fonts.bold },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textDim,
    marginTop: 24,
    lineHeight: 16,
  },
});
