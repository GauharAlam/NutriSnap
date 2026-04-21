import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/api';
import { Colors, Fonts, Radius } from '../../lib/colors';
import GlassCard from '../../components/GlassCard';

const categoryIcons = {
  'Fat Loss': '🔥', 'Muscle Gain': '💪', 'Strength': '🏋️',
  'Yoga': '🧘', 'Cardio': '🏃', 'HIIT': '⚡',
};

const difficultyColors = {
  Beginner:     { color: Colors.neonGreen,  bg: 'rgba(34,197,94,0.1)' },
  Intermediate: { color: Colors.neonBlue,   bg: 'rgba(0,212,255,0.1)' },
  Advanced:     { color: Colors.neonPurple, bg: 'rgba(168,85,247,0.1)' },
};

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get(`/workout-plans/${id}`);
        if (data?.success) setPlan(data.data);
      } catch (err) {
        console.log('Failed to load plan:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleLogWorkout() {
    if (!plan || isLogging) return;
    setIsLogging(true);
    try {
      const currentDay = plan.schedule?.[activeDay];
      const exercises = currentDay?.exercises || plan.exercises || [];
      await apiClient.post('/workouts', {
        title: plan.title,
        category: plan.category,
        durationMinutes: parseInt(plan.duration) || 30,
        caloriesBurned: parseInt(plan.calories) || 200,
        totalSets: exercises.reduce((a, e) => a + (e.sets || 3), 0),
        exercises: exercises.map((e) => ({
          name: e.name,
          sets: e.sets || 3,
          reps: e.reps || 12,
          weight: e.weight || 0,
        })),
      });
      router.back();
    } catch (err) {
      console.log('Log workout error:', err.message);
    } finally {
      setIsLogging(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.neonBlue} />
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>😕</Text>
          <Text style={styles.emptyTitle}>Workout not found</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: Colors.neonBlue, ...Fonts.semibold }}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const exercises = plan.schedule?.[activeDay]?.exercises || plan.exercises || [];
  const diff = difficultyColors[plan.difficulty] || difficultyColors.Beginner;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textSec} />
        </Pressable>

        {/* Hero */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['rgba(0,212,255,0.15)', 'rgba(168,85,247,0.08)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.heroIconBox}>
            <Text style={{ fontSize: 36 }}>{categoryIcons[plan.category] || '🔥'}</Text>
          </View>
          <Text style={styles.heroTitle}>{plan.title}</Text>
          <View style={styles.heroBadges}>
            <View style={[styles.heroBadge, { backgroundColor: diff.bg }]}>
              <Text style={[styles.heroBadgeText, { color: diff.color }]}>{plan.difficulty}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>⏱ {plan.duration}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🔥 {plan.calories} cal</Text>
            </View>
          </View>
          {plan.description && (
            <Text style={styles.heroDesc}>{plan.description}</Text>
          )}
        </View>

        {/* Day Selector (if schedule exists) */}
        {plan.schedule && plan.schedule.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayRow}
          >
            {plan.schedule.map((day, i) => (
              <Pressable
                key={i}
                onPress={() => setActiveDay(i)}
                style={[styles.dayChip, activeDay === i && styles.dayChipActive]}
              >
                <Text style={[styles.dayChipText, activeDay === i && styles.dayChipTextActive]}>
                  {day.name || `Day ${i + 1}`}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Exercises */}
        <Text style={styles.sectionLabel}>
          {exercises.length} Exercise{exercises.length !== 1 ? 's' : ''}
        </Text>

        {exercises.map((exercise, i) => (
          <GlassCard key={i} variant="sm" style={styles.exerciseCard}>
            <View style={styles.exerciseNum}>
              <Text style={styles.exerciseNumText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.exerciseMeta}>
                {exercise.sets && (
                  <Text style={styles.exerciseMetaText}>{exercise.sets} sets</Text>
                )}
                {exercise.reps && (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.exerciseMetaText}>{exercise.reps} reps</Text>
                  </>
                )}
                {exercise.duration && (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.exerciseMetaText}>{exercise.duration}</Text>
                  </>
                )}
                {exercise.rest && (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.exerciseMetaText}>🔄 {exercise.rest}</Text>
                  </>
                )}
              </View>
              {exercise.notes && (
                <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
              )}
            </View>
          </GlassCard>
        ))}

        {/* Log Workout Button */}
        <Pressable
          onPress={handleLogWorkout}
          disabled={isLogging}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
        >
          <LinearGradient
            colors={isLogging ? ['#555', '#444'] : Colors.gradientBlue}
            style={styles.logBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLogging ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.logBtnText}>✅ Complete & Log Workout</Text>
            )}
          </LinearGradient>
        </Pressable>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },

  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },

  // Hero
  heroCard: {
    borderRadius: Radius.xl, borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)', padding: 24,
    alignItems: 'center', overflow: 'hidden',
  },
  heroIconBox: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: 'rgba(0,212,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  heroTitle: { fontSize: 22, color: Colors.text, ...Fonts.display, textAlign: 'center' },
  heroBadges: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  heroBadge: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: Colors.bgInput,
  },
  heroBadgeText: { fontSize: 11, color: Colors.textSec, ...Fonts.semibold },
  heroDesc: { fontSize: 13, color: Colors.textSec, lineHeight: 20, marginTop: 14, textAlign: 'center' },

  // Day selector
  dayRow: { gap: 8, paddingVertical: 4 },
  dayChip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgInput,
  },
  dayChipActive: { borderColor: Colors.neonBlue, backgroundColor: 'rgba(0,212,255,0.1)' },
  dayChipText: { fontSize: 13, color: Colors.textSec, ...Fonts.medium },
  dayChipTextActive: { color: Colors.neonBlue },

  // Exercises
  sectionLabel: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, letterSpacing: 1.5, textTransform: 'uppercase' },
  exerciseCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 4 },
  exerciseNum: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(0,212,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  exerciseNumText: { fontSize: 14, color: Colors.neonBlue, ...Fonts.bold },
  exerciseName: { fontSize: 15, color: Colors.text, ...Fonts.semibold },
  exerciseMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  exerciseMetaText: { fontSize: 12, color: Colors.textSec },
  metaDot: { color: Colors.textMuted, fontSize: 8 },
  exerciseNotes: { fontSize: 11, color: Colors.textMuted, marginTop: 6, fontStyle: 'italic' },

  emptyTitle: { fontSize: 16, color: Colors.text, ...Fonts.semibold },

  // Log button
  logBtn: { borderRadius: Radius.full, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  logBtnText: { color: '#fff', fontSize: 15, ...Fonts.bold },
});
