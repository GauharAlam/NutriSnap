import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../../lib/api';
import { Colors, Fonts, Radius } from '../../lib/colors';
import GlassCard from '../../components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ─── Simple Bar Chart Component ─── */
function BarChart({ data, color = Colors.neonOrange, height = 100 }) {
  const max = Math.max(...data, 1);
  return (
    <View style={[barStyles.container, { height }]}>
      {data.map((val, i) => {
        const barH = (val / max) * (height - 20);
        return (
          <View key={i} style={barStyles.barWrapper}>
            <View style={barStyles.barTrack}>
              <LinearGradient
                colors={[color, color + '60']}
                style={[barStyles.barFill, { height: Math.max(barH, 2) }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </View>
            {i === data.length - 1 && (
              <View style={[barStyles.dot, { backgroundColor: color }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  barWrapper: { flex: 1, alignItems: 'center' },
  barTrack: { width: '100%', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
});

export default function ProgressScreen() {
  const [weeklyData, setWeeklyData] = useState(null);
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0, totalDuration: 0, totalCalories: 0, totalSets: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [progressRes, workoutRes] = await Promise.all([
        apiClient.get('/progress/weekly'),
        apiClient.get('/workouts'),
      ]);
      if (progressRes.data?.success) setWeeklyData(progressRes.data.data);
      if (workoutRes.data?.success) setWorkoutStats(workoutRes.data.data.stats);
    } catch (err) {
      console.log('Progress fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !weeklyData) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeleton} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  const { days, averages, totals } = weeklyData;
  const calorieArray = days.map((d) => d.summary.calories);
  const proteinArray = days.map((d) => d.summary.protein);
  const loggedDays = days.filter((d) => d.summary.calories > 0).length;

  const weeklyVisuals = days.map((d) => {
    const dayName = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });
    const isActive = d.summary.calories > 0;
    const isOptimized = d.summary.calories > (weeklyData.target.calories * 0.8)
      && d.summary.calories < (weeklyData.target.calories * 1.2);
    return {
      day: dayName,
      active: isActive,
      color: isActive ? (isOptimized ? Colors.neonGreen : Colors.neonOrange) : Colors.textDim,
    };
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.sectionLabel}>Analytics</Text>
        <Text style={styles.sectionTitle}>Your Progress</Text>

        {/* Week Pulse Hero */}
        <View style={styles.pulseCard}>
          <LinearGradient
            colors={['rgba(249,115,22,0.15)', 'rgba(236,72,153,0.08)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.pulseTop}>
            <View>
              <Text style={styles.pulseLabel}>Weekly Adherence</Text>
              <View style={styles.pulseValRow}>
                <Text style={styles.pulseVal}>{weeklyData.adherenceDays || loggedDays}</Text>
                <Text style={styles.pulseOf}> / 7 days</Text>
              </View>
              <Text style={styles.pulseSub}>{loggedDays} days logged this week</Text>
            </View>
            <Text style={{ fontSize: 44 }}>📈</Text>
          </View>
          <View style={styles.weekDots}>
            {weeklyVisuals.map((day, i) => (
              <View key={i} style={styles.weekDotCol}>
                <View style={[styles.weekBar, { backgroundColor: day.color }]} />
                <Text style={styles.weekDayText}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Calorie Trend */}
        <GlassCard>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Calorie Trend</Text>
              <Text style={styles.chartSub}>This week</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.chartAvg, { color: Colors.neonOrange }]}>{averages.calories || 0}</Text>
              <Text style={styles.chartAvgLabel}>avg/day</Text>
            </View>
          </View>
          <BarChart data={calorieArray.length > 0 ? calorieArray : [0]} color={Colors.neonOrange} />
        </GlassCard>

        {/* Protein Trend */}
        <GlassCard>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Protein Intake Trend</Text>
              <Text style={styles.chartSub}>This week</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.chartAvg, { color: Colors.neonBlue }]}>{averages.protein || 0}g</Text>
              <Text style={[styles.chartAvgLabel, { color: Colors.neonBlue }]}>avg/day</Text>
            </View>
          </View>
          <BarChart data={proteinArray.length > 0 ? proteinArray : [0]} color={Colors.neonBlue} />
        </GlassCard>

        {/* Overall Stats */}
        <Text style={styles.sectionLabel}>Overall Activity Summary</Text>
        <View style={styles.summaryGrid}>
          {[
            { label: 'Total Workouts', value: workoutStats.totalWorkouts || '0', icon: '🏋️', delta: 'Since signup', dColor: Colors.neonGreen },
            { label: 'Total Calories', value: workoutStats.totalCalories || totals.calories || '0', icon: '🔥', delta: 'Burned', dColor: Colors.neonOrange },
            { label: 'Total Minutes', value: `${workoutStats.totalDuration}m`, icon: '⏱', delta: 'Trained', dColor: Colors.neonPurple },
            { label: 'Total Sets', value: workoutStats.totalSets || '0', icon: '💪', delta: 'Completed', dColor: Colors.neonTeal },
          ].map((card) => (
            <GlassCard key={card.label} variant="sm" style={styles.summaryCard}>
              <Text style={{ fontSize: 20 }}>{card.icon}</Text>
              <Text style={styles.summaryVal}>{card.value}</Text>
              <Text style={styles.summaryLabel}>{card.label}</Text>
              <Text style={[styles.summaryDelta, { color: card.dColor }]}>{card.delta}</Text>
            </GlassCard>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  loadingContainer: { flex: 1, padding: 16, gap: 12 },
  skeleton: { height: 120, borderRadius: Radius.xl, backgroundColor: Colors.bgInput },

  sectionLabel: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, letterSpacing: 1.5, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 22, color: Colors.text, ...Fonts.display, marginTop: 2, marginBottom: 4 },

  // Pulse
  pulseCard: {
    borderRadius: Radius.xl, borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.15)',
    padding: 20, overflow: 'hidden',
  },
  pulseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pulseLabel: { fontSize: 12, color: Colors.textSec, ...Fonts.medium },
  pulseValRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  pulseVal: { fontSize: 40, color: Colors.text, ...Fonts.display },
  pulseOf: { fontSize: 14, color: Colors.textSec },
  pulseSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  weekDots: { flexDirection: 'row', gap: 6, marginTop: 16 },
  weekDotCol: { flex: 1, alignItems: 'center', gap: 4 },
  weekBar: { width: '100%', height: 8, borderRadius: 4 },
  weekDayText: { fontSize: 9, color: Colors.textMuted },

  // Charts
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  chartTitle: { fontSize: 14, color: Colors.text, ...Fonts.semibold },
  chartSub: { fontSize: 11, color: Colors.textSec, marginTop: 2 },
  chartAvg: { fontSize: 18, ...Fonts.bold },
  chartAvgLabel: { fontSize: 10, color: Colors.textSec },

  // Summary
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: { width: '47.5%', gap: 4 },
  summaryVal: { fontSize: 20, color: Colors.text, ...Fonts.bold, marginTop: 6 },
  summaryLabel: { fontSize: 11, color: Colors.textSec },
  summaryDelta: { fontSize: 10, ...Fonts.medium },
});
