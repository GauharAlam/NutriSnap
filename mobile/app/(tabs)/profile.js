import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../lib/auth-context';
import { apiClient } from '../../lib/api';
import { Colors, Fonts, Radius } from '../../lib/colors';
import GlassCard from '../../components/GlassCard';

const goalPresets = {
  weight_loss:  { calories: 1800, protein: 140, carbs: 160, fats: 60, sugar: 35 },
  muscle_gain:  { calories: 2600, protein: 170, carbs: 300, fats: 75, sugar: 45 },
  maintenance:  { calories: 2200, protein: 150, carbs: 220, fats: 70, sugar: 40 },
};

const settingsSections = [
  {
    title: 'Preferences',
    items: [
      { icon: '🔔', label: 'Push Notifications', type: 'toggle' },
      { icon: '⌚', label: 'Smartwatch Sync', type: 'toggle' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: '🔒', label: 'Privacy & Security', type: 'link' },
      { icon: '📊', label: 'Data & Export', type: 'link' },
      { icon: '❓', label: 'Help & Support', type: 'link' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [goalData, setGoalData] = useState(null);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const [toggles, setToggles] = useState({ 'Push Notifications': true, 'Smartwatch Sync': false });

  const firstName = user?.name?.split(' ')[0] || 'Athlete';

  const fetchData = useCallback(async () => {
    try {
      const [goalRes, workoutRes] = await Promise.all([
        apiClient.get('/goals'),
        apiClient.get('/workouts'),
      ]);
      if (goalRes.data.success) setGoalData(goalRes.data.data);
      if (workoutRes.data.success) setWorkoutStats(workoutRes.data.data.stats);
    } catch (err) {
      console.log('Profile data error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleGoalChange(type) {
    if (goalData?.goalType === type || isUpdatingGoal) return;
    setIsUpdatingGoal(true);
    try {
      const { data } = await apiClient.put('/goals', {
        goalType: type,
        dailyTargets: goalPresets[type],
        weeklyWorkoutDays: goalData?.weeklyWorkoutDays || 4,
        notes: goalData?.notes || '',
      });
      if (data.success) setGoalData(data.data);
    } catch {
      Alert.alert('Error', 'Failed to update goal.');
    } finally {
      setIsUpdatingGoal(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.neonBlue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <GlassCard style={styles.profileCard}>
          <LinearGradient
            colors={Colors.gradientBlue}
            style={styles.avatarCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
          </LinearGradient>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          <View style={styles.quickStats}>
            {[
              { label: 'Workouts', value: workoutStats?.totalWorkouts || 0 },
              { label: 'Active Mins', value: workoutStats?.totalDuration || 0 },
              { label: 'Level', value: (workoutStats?.totalWorkouts || 0) > 10 ? 'Pro' : 'Rookie' },
            ].map((s) => (
              <View key={s.label} style={styles.quickStatItem}>
                <Text style={styles.quickStatVal}>{s.value}</Text>
                <Text style={styles.quickStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Goal Settings */}
        <GlassCard>
          <View style={styles.goalHeader}>
            <Text style={styles.cardTitle}>Fitness Goal</Text>
            {isUpdatingGoal && (
              <Text style={styles.updatingText}>Updating...</Text>
            )}
          </View>
          <View style={styles.goalRow}>
            {[
              { id: 'weight_loss', label: 'Lose Weight', icon: '🔥' },
              { id: 'muscle_gain', label: 'Build Muscle', icon: '💪' },
              { id: 'maintenance', label: 'Stay Fit', icon: '⚡' },
            ].map((goal) => (
              <Pressable
                key={goal.id}
                onPress={() => handleGoalChange(goal.id)}
                disabled={isUpdatingGoal}
                style={[
                  styles.goalBtn,
                  goalData?.goalType === goal.id && styles.goalBtnActive,
                ]}
              >
                <Text style={{ fontSize: 20 }}>{goal.icon}</Text>
                <Text style={[
                  styles.goalLabel,
                  goalData?.goalType === goal.id && styles.goalLabelActive,
                ]}>
                  {goal.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {goalData && (
            <View style={styles.goalFooter}>
              <Text style={styles.goalFooterText}>
                Daily: <Text style={{ color: Colors.text, ...Fonts.bold }}>{goalData.dailyTargets?.calories} kcal</Text>
              </Text>
              <Text style={styles.goalFooterText}>
                Protein: <Text style={{ color: Colors.text, ...Fonts.bold }}>{goalData.dailyTargets?.protein}g</Text>
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Settings */}
        {settingsSections.map((section) => (
          <View key={section.title}>
            <Text style={[styles.sectionLabel, { marginBottom: 8 }]}>{section.title}</Text>
            <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
              {section.items.map((item, i) => (
                <View
                  key={item.label}
                  style={[
                    styles.settingRow,
                    i < section.items.length - 1 && styles.settingDivider,
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.type === 'toggle' ? (
                    <Pressable
                      onPress={() => setToggles((p) => ({ ...p, [item.label]: !p[item.label] }))}
                    >
                      <View style={[styles.toggle, toggles[item.label] && styles.toggleOn]}>
                        <View style={[
                          styles.toggleDot,
                          toggles[item.label] && styles.toggleDotOn,
                        ]} />
                      </View>
                    </Pressable>
                  ) : (
                    <Text style={{ color: Colors.textMuted, fontSize: 14 }}>›</Text>
                  )}
                </View>
              ))}
            </GlassCard>
          </View>
        ))}

        {/* Sign Out */}
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>NutriSnap v2.1.0 ⚡</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  content: { padding: 16, gap: 14 },

  sectionLabel: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, letterSpacing: 1.5, textTransform: 'uppercase' },
  cardTitle: { fontSize: 14, color: Colors.text, ...Fonts.semibold },

  // Profile
  profileCard: { alignItems: 'center' },
  avatarCircle: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 28, ...Fonts.bold },
  profileName: { fontSize: 18, color: Colors.text, ...Fonts.display, marginTop: 12 },
  profileEmail: { fontSize: 12, color: Colors.textSec, marginTop: 2 },
  quickStats: {
    flexDirection: 'row', gap: 10, marginTop: 16,
    width: '100%',
  },
  quickStatItem: {
    flex: 1, alignItems: 'center',
    backgroundColor: Colors.bgInput, borderRadius: Radius.lg,
    paddingVertical: 12, borderWidth: 1, borderColor: Colors.border,
  },
  quickStatVal: { fontSize: 18, color: Colors.text, ...Fonts.bold },
  quickStatLabel: { fontSize: 10, color: Colors.textMuted, ...Fonts.semibold, textTransform: 'uppercase', marginTop: 2, letterSpacing: 0.5 },

  // Goals
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  updatingText: { fontSize: 10, color: Colors.neonBlue, ...Fonts.medium },
  goalRow: { flexDirection: 'row', gap: 8 },
  goalBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    paddingVertical: 14, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgInput,
  },
  goalBtnActive: {
    borderColor: 'rgba(0,212,255,0.4)',
    backgroundColor: 'rgba(0,212,255,0.08)',
  },
  goalLabel: { fontSize: 11, color: Colors.textSec, ...Fonts.medium },
  goalLabelActive: { color: Colors.neonBlue },
  goalFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 12, paddingTop: 10, borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  goalFooterText: { fontSize: 10, color: Colors.textMuted },

  // Settings
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  settingDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingLabel: { flex: 1, fontSize: 14, color: Colors.textSec },
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: Colors.textDim,
    justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: Colors.neonBlue },
  toggleDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleDotOn: { alignSelf: 'flex-end' },

  // Logout
  logoutBtn: {
    paddingVertical: 16, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
    backgroundColor: 'rgba(239,68,68,0.05)',
    alignItems: 'center',
  },
  logoutText: { fontSize: 14, color: Colors.error, ...Fonts.bold },

  version: { textAlign: 'center', fontSize: 10, color: Colors.textDim, marginTop: 4 },
});
