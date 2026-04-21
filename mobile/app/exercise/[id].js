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
import RestTimer from '../../components/RestTimer';

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

  // Active Workout State
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checkedSets, setCheckedSets] = useState({}); // { 'exId_setIndex': boolean }
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [currentRestDuration, setCurrentRestDuration] = useState(60);

  // Stopwatch
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => setElapsedSeconds(p => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleSet = (exIndex, setIndex, restSecs) => {
    const key = `${exIndex}_${setIndex}`;
    setCheckedSets(prev => {
      const isChecking = !prev[key];
      if (isChecking) {
        // Trigger rest timer
        setCurrentRestDuration(restSecs || 60);
        setRestTimerVisible(true);
      }
      return { ...prev, [key]: isChecking };
    });
  };

  const formatElapsed = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
        durationMinutes: isActive ? Math.max(1, Math.floor(elapsedSeconds / 60)) : parseInt(plan.duration) || 30,
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
        {/* Active Header */}
        {isActive && (
          <View style={styles.activeHeader}>
            <View>
              <Text style={styles.activeStatusText}>⏱️ Workout in progress</Text>
              <Text style={styles.elapsedTime}>{formatElapsed(elapsedSeconds)}</Text>
            </View>
            <Pressable onPress={handleLogWorkout} disabled={isLogging} style={styles.finishBtn}>
              {isLogging ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.finishBtnText}>Finish</Text>}
            </Pressable>
          </View>
        )}

        {/* Back Button (only show if not active) */}
        {!isActive && (
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textSec} />
          </Pressable>
        )}

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

        {/* Action Button */}
        {!isActive && (
          <Pressable onPress={() => setIsActive(true)} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <LinearGradient
              colors={Colors.gradientBlue}
              style={styles.logBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.logBtnText}>⚡ Start Workout</Text>
            </LinearGradient>
          </Pressable>
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

              {/* Set Checkboxes for Active Mode */}
              {isActive && (
                <View style={styles.setsContainer}>
                  {Array.from({ length: exercise.sets || 3 }).map((_, setIdx) => {
                    const isChecked = checkedSets[`${i}_${setIdx}`];
                    const restVal = exercise.rest ? parseInt(String(exercise.rest).replace(/\D/g, '')) || 60 : 60;
                    
                    return (
                      <Pressable 
                        key={setIdx} 
                        style={[styles.setRow, isChecked && styles.setRowChecked]}
                        onPress={() => toggleSet(i, setIdx, restVal)}
                      >
                        <View style={[styles.setBox, isChecked && styles.setBoxChecked]}>
                          {isChecked && <Ionicons name="checkmark" size={14} color="#000" />}
                        </View>
                        <Text style={[styles.setText, isChecked && styles.setTextChecked]}>
                          Set {setIdx + 1}
                        </Text>
                        <Text style={styles.setRepsText}>{exercise.reps || 12} reps</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </GlassCard>
        ))}

        {/* Action Button at bottom for finish */}
        {isActive && (
          <Pressable onPress={handleLogWorkout} disabled={isLogging} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <LinearGradient
              colors={isLogging ? ['#555', '#444'] : Colors.gradientBlue}
              style={styles.logBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLogging ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.logBtnText}>✅ Finish & Save</Text>}
            </LinearGradient>
          </Pressable>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Rest Timer Modal */}
      <RestTimer 
        visible={restTimerVisible} 
        duration={currentRestDuration} 
        onClose={() => setRestTimerVisible(false)} 
      />
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

  // Active Mode
  activeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.bgInput, padding: 16, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  activeStatusText: { fontSize: 11, color: Colors.textSec, ...Fonts.semibold, textTransform: 'uppercase' },
  elapsedTime: { fontSize: 28, color: Colors.text, ...Fonts.display, marginTop: 4 },
  finishBtn: { backgroundColor: Colors.neonBlue, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full },
  finishBtnText: { color: '#000', fontSize: 14, ...Fonts.bold },

  setsContainer: { marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12, gap: 8, width: '100%' },
  setRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: Radius.sm },
  setRowChecked: { backgroundColor: 'rgba(0,212,255,0.08)' },
  setBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: Colors.border, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  setBoxChecked: { backgroundColor: Colors.neonBlue, borderColor: Colors.neonBlue },
  setText: { fontSize: 13, color: Colors.text, ...Fonts.medium, flex: 1 },
  setTextChecked: { color: Colors.textSec, textDecorationLine: 'line-through' },
  setRepsText: { fontSize: 12, color: Colors.textSec },

  // Log button
  logBtn: { borderRadius: Radius.full, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  logBtnText: { color: '#fff', fontSize: 15, ...Fonts.bold },
});
