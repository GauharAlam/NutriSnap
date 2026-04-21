import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth-context';
import { apiClient } from '../../lib/api';
import { Colors, Fonts, Radius } from '../../lib/colors';
import CircleProgress from '../../components/CircleProgress';
import GlassCard from '../../components/GlassCard';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [greeting, setGreeting] = useState('Good morning');
  const [dailyProgress, setDailyProgress] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [waterCount, setWaterCount] = useState(0);

  const firstName = user?.name?.split(' ')[0] || 'Athlete';

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [progressRes, workoutRes, waterRes] = await Promise.all([
        apiClient.get('/progress/daily'),
        apiClient.get('/workouts'),
        apiClient.get('/water/today'),
      ]);
      if (progressRes.data.success) setDailyProgress(progressRes.data.data);
      if (workoutRes.data.success) setWorkoutData(workoutRes.data.data);
      if (waterRes.data.success) {
        // Convert ml to glasses (250ml per glass)
        setWaterCount(Math.min(8, Math.floor((waterRes.data.data.amountMl || 0) / 250)));
      }
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.log('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const latestWorkout = workoutData?.workouts?.[0] || null;
  const caloriesConsumed = dailyProgress?.summary?.calories || 0;
  const caloriesTarget = dailyProgress?.target?.calories || 2400;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.neonBlue} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>{today.toUpperCase()}</Text>
            <Text style={styles.greetingText}>
              {greeting}, <Text style={{ color: Colors.neonBlue }}>{firstName}</Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <Text style={{ fontSize: 14 }}>🔥</Text>
              <Text style={{ fontSize: 13, color: Colors.neonOrange, fontWeight: '700', marginLeft: 4 }}>
                {user?.currentStreak || 0} Day Streak
              </Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/profile')}>
            <LinearGradient
              colors={Colors.gradientBlue}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Hero Workout Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['rgba(0,212,255,0.15)', 'rgba(168,85,247,0.08)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {latestWorkout ? (
            <View>
              <View style={styles.heroTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.badge}>
                    <View style={styles.badgeDot} />
                    <Text style={styles.badgeText}>Latest Workout</Text>
                  </View>
                  <Text style={styles.heroTitle} numberOfLines={1}>{latestWorkout.title}</Text>
                  <View style={styles.heroMeta}>
                    <Text style={styles.heroMetaText}>⏱ {latestWorkout.durationMinutes}m</Text>
                    <Text style={styles.heroMetaText}>🏋️ {latestWorkout.totalSets} sets</Text>
                    <Text style={styles.heroMetaText}>🔥 {latestWorkout.caloriesBurned} cal</Text>
                  </View>
                </View>
                <CircleProgress value={100} max={100} size={64} strokeWidth={5} showPercent />
              </View>
              <Pressable onPress={() => router.push('/(tabs)/workouts')}>
                <LinearGradient
                  colors={Colors.gradientBlue}
                  style={styles.heroBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.heroBtnText}>Continue Training →</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            <View style={styles.heroEmpty}>
              <Text style={{ fontSize: 40 }}>💪</Text>
              <Text style={styles.heroTitle}>Ready to train?</Text>
              <Text style={styles.heroSubtitle}>Start your first workout session!</Text>
              <Pressable onPress={() => router.push('/(tabs)/workouts')}>
                <LinearGradient
                  colors={Colors.gradientBlue}
                  style={[styles.heroBtn, { marginTop: 16 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.heroBtnText}>Browse Workouts →</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <Text style={styles.sectionLabel}>Today's Stats</Text>
        <View style={styles.statsGrid}>
          {[
            { icon: '🔥', value: caloriesConsumed, label: 'Calories Eaten', color: Colors.neonOrange },
            { icon: '💪', value: workoutData?.stats?.totalSets || 0, label: 'Total Sets', color: Colors.neonBlue },
            { icon: '🏆', value: workoutData?.stats?.totalWorkouts || 0, label: 'Workouts Done', color: Colors.neonGreen },
            { icon: '⏱️', value: `${workoutData?.stats?.totalDuration || 0}m`, label: 'Active Time', color: Colors.neonPurple },
          ].map((stat, i) => (
            <GlassCard key={i} variant="sm" style={styles.statCard}>
              <View style={styles.statTop}>
                <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
                <View style={[styles.statDot, { backgroundColor: stat.color }]} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Calories + Water Row */}
        <View style={styles.calWaterRow}>
          <GlassCard style={styles.calCard}>
            <CircleProgress
              value={caloriesConsumed}
              max={caloriesTarget}
              size={85}
              strokeWidth={6}
              color={Colors.neonOrange}
              label="kcal"
            />
            <Text style={styles.calRemaining}>
              {caloriesTarget - caloriesConsumed > 0
                ? `${caloriesTarget - caloriesConsumed} left`
                : 'Goal hit! 🎉'}
            </Text>
          </GlassCard>

          <GlassCard style={styles.waterCard}>
            <View style={styles.waterHeader}>
              <View>
                <Text style={styles.waterTitle}>Water</Text>
                <Text style={styles.waterSub}>{waterCount}/8 glasses</Text>
              </View>
              <Text style={{ fontSize: 20 }}>💧</Text>
            </View>
            <View style={styles.waterGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Pressable
                  key={i}
                  onPress={async () => {
                    if (i < waterCount) return; // Only allow adding
                    const newCount = i + 1;
                    setWaterCount(newCount);
                    try {
                      // We only log the delta to the backend (+250ml per tap)
                      await apiClient.post('/water', {
                        amount: 250 * (newCount - waterCount)
                      });
                    } catch (e) {
                      console.log('Failed to log water', e);
                    }
                  }}
                  style={[
                    styles.waterBlock,
                    i < waterCount && styles.waterBlockFilled,
                  ]}
                />
              ))}
            </View>
          </GlassCard>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Recent Activity</Text>
          <Pressable onPress={() => router.push('/(tabs)/workouts')}>
            <Text style={styles.viewAll}>View All →</Text>
          </Pressable>
        </View>
        {workoutData?.workouts?.slice(0, 3).map((w, i) => (
          <GlassCard key={w._id || i} variant="sm" style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={{ fontSize: 20 }}>
                {w.category === 'Fat Loss' ? '🔥' : w.category === 'Strength' ? '💪' : '🏋️'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityTitle} numberOfLines={1}>{w.title}</Text>
              <Text style={styles.activitySub}>{w.category}</Text>
            </View>
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeText}>{w.durationMinutes}m</Text>
            </View>
          </GlassCard>
        ))}
        {(!workoutData?.workouts || workoutData.workouts.length === 0) && (
          <GlassCard style={styles.emptyCard}>
            <Text style={{ fontSize: 30, textAlign: 'center' }}>🏃</Text>
            <Text style={styles.emptyText}>No activity yet. Time to start!</Text>
          </GlassCard>
        )}

        {/* AI Coach Widget */}
        <GlassCard
          variant="accent"
          style={{ marginTop: 8 }}
          onPress={() => router.push('/coach')}
        >
          <View style={styles.aiHeader}>
            <LinearGradient
              colors={Colors.gradientPink}
              style={styles.aiIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={{ fontSize: 18 }}>🤖</Text>
            </LinearGradient>
            <View>
              <Text style={styles.aiTitle}>AI Trainer</Text>
              <Text style={styles.aiSub}>Personalized insight</Text>
            </View>
          </View>
          <View style={styles.aiBody}>
            <Text style={styles.aiText}>
              {latestWorkout
                ? `Great job completing ${latestWorkout.title}! You burned ${latestWorkout.caloriesBurned} calories. Keep it going! 💪`
                : "Welcome to NutriSnap! Your AI trainer is ready. Let's start with a workout today! 🚀"}
            </Text>
          </View>
        </GlassCard>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dateText: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, letterSpacing: 1.5 },
  greetingText: { fontSize: 22, color: Colors.text, ...Fonts.display, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, ...Fonts.bold },

  // Hero
  heroCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    padding: 20,
    overflow: 'hidden',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,212,255,0.12)', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.neonBlue },
  badgeText: { fontSize: 11, color: Colors.neonBlue, ...Fonts.semibold },
  heroTitle: { fontSize: 18, color: Colors.text, ...Fonts.display, marginTop: 10 },
  heroMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  heroMetaText: { fontSize: 12, color: Colors.textSec },
  heroBtn: { borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  heroBtnText: { color: '#fff', fontSize: 14, ...Fonts.bold },
  heroEmpty: { alignItems: 'center', paddingVertical: 12 },
  heroSubtitle: { fontSize: 14, color: Colors.textSec, marginTop: 4 },

  // Stats Grid
  sectionLabel: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, letterSpacing: 1.5, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47.5%' },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statValue: { fontSize: 20, color: Colors.text, ...Fonts.bold },
  statLabel: { fontSize: 11, color: Colors.textSec, marginTop: 2 },

  // Calories + Water
  calWaterRow: { flexDirection: 'row', gap: 10 },
  calCard: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  calRemaining: { fontSize: 10, color: Colors.textSec, marginTop: 8, ...Fonts.medium },
  waterCard: { flex: 3 },
  waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  waterTitle: { fontSize: 14, color: Colors.text, ...Fonts.semibold },
  waterSub: { fontSize: 11, color: Colors.textSec },
  waterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  waterBlock: {
    width: '22%', height: 28, borderRadius: 8,
    backgroundColor: Colors.bgInput,
  },
  waterBlockFilled: {
    backgroundColor: Colors.neonBlue,
  },

  // Recent Activity
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { fontSize: 12, color: Colors.neonBlue, ...Fonts.medium },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  activityIcon: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center',
  },
  activityTitle: { fontSize: 14, color: Colors.text, ...Fonts.semibold },
  activitySub: { fontSize: 11, color: Colors.textSec, textTransform: 'capitalize', marginTop: 2 },
  activityBadge: {
    backgroundColor: 'rgba(0,212,255,0.1)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
  },
  activityBadgeText: { fontSize: 11, color: Colors.neonBlue, ...Fonts.semibold },

  // Empty state
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 13, color: Colors.textSec, marginTop: 8 },

  // AI Coach
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  aiIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 14, color: Colors.text, ...Fonts.semibold },
  aiSub: { fontSize: 11, color: Colors.textSec },
  aiBody: { backgroundColor: Colors.bgInput, borderRadius: Radius.lg, padding: 12 },
  aiText: { fontSize: 12, color: Colors.textSec, lineHeight: 18 },
});
