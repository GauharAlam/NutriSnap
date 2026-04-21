import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../../lib/api';
import { Colors, Fonts, Radius } from '../../lib/colors';
import GlassCard from '../../components/GlassCard';

const categories = [
  { id: 'fat-loss', name: 'Fat Loss', icon: '🔥' },
  { id: 'muscle-gain', name: 'Muscle Gain', icon: '💪' },
  { id: 'strength', name: 'Strength', icon: '🏋️' },
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
  { id: 'cardio', name: 'Cardio', icon: '🏃' },
  { id: 'hiit', name: 'HIIT', icon: '⚡' },
];

const filters = ['All', 'Fat Loss', 'Muscle Gain', 'Strength', 'Yoga', 'Cardio', 'HIIT'];

const difficultyColors = {
  Beginner:     { color: Colors.neonGreen,  bg: 'rgba(34,197,94,0.1)' },
  Intermediate: { color: Colors.neonBlue,   bg: 'rgba(0,212,255,0.1)' },
  Advanced:     { color: Colors.neonPurple, bg: 'rgba(168,85,247,0.1)' },
};

const categoryIcons = {
  'Fat Loss': '🔥', 'Muscle Gain': '💪', 'Strength': '🏋️',
  'Yoga': '🧘', 'Cardio': '🏃', 'HIIT': '⚡',
};

export default function WorkoutsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/workout-plans');
        if (data?.success) setWorkoutPlans(data.data);
      } catch (err) {
        console.log('Failed to load plans:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredPlans = useMemo(() => {
    return workoutPlans.filter((plan) => {
      const matchSearch = plan.title.toLowerCase().includes(search.toLowerCase());
      const matchFilter = activeFilter === 'All' || plan.category === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [workoutPlans, activeFilter, search]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.sectionLabel}>Explore</Text>
        <Text style={styles.sectionTitle}>Workout Plans</Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {filters.map((f) => (
            <Pressable
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Category Grid */}
        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Categories</Text>
        <View style={styles.catGrid}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setActiveFilter(activeFilter === cat.name ? 'All' : cat.name)}
              style={[
                styles.catCard,
                activeFilter === cat.name && styles.catCardActive,
              ]}
            >
              <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
              <Text style={styles.catName}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Plan Cards */}
        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
          {activeFilter === 'All' ? 'All Plans' : activeFilter}
        </Text>

        {loading ? (
          [1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard} />
          ))
        ) : filteredPlans.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={{ fontSize: 36, textAlign: 'center' }}>🔍</Text>
            <Text style={styles.emptyTitle}>No workouts found</Text>
            <Text style={styles.emptyText}>
              {search ? 'Try a different search term' : 'No plans in this category yet'}
            </Text>
            {(search || activeFilter !== 'All') && (
              <Pressable onPress={() => { setSearch(''); setActiveFilter('All'); }}>
                <Text style={styles.clearFilter}>Clear Filters</Text>
              </Pressable>
            )}
          </GlassCard>
        ) : (
          filteredPlans.map((plan) => (
            <GlassCard
              key={plan.slug}
              variant="sm"
              style={styles.planCard}
              onPress={() => router.push(`/exercise/${plan.slug}`)}
            >
              <View style={styles.planIcon}>
                <Text style={{ fontSize: 20 }}>{categoryIcons[plan.category] || '🔥'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planTitle} numberOfLines={1}>{plan.title}</Text>
                <View style={styles.planMeta}>
                  <Text style={styles.planMetaText}>⏱ {plan.duration}</Text>
                  <Text style={styles.planMetaDot}>•</Text>
                  <Text style={styles.planMetaText}>🔥 {plan.calories}</Text>
                </View>
              </View>
              <View style={[
                styles.diffBadge,
                { backgroundColor: (difficultyColors[plan.difficulty] || difficultyColors.Beginner).bg },
              ]}>
                <Text style={[
                  styles.diffText,
                  { color: (difficultyColors[plan.difficulty] || difficultyColors.Beginner).color },
                ]}>
                  {plan.difficulty}
                </Text>
              </View>
            </GlassCard>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  content: { padding: 16, gap: 10 },

  sectionLabel: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, letterSpacing: 1.5, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 22, color: Colors.text, ...Fonts.display, marginTop: 2, marginBottom: 8 },

  // Search
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgInput, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, height: 48,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  clearBtn: { fontSize: 16, color: Colors.textSec, paddingLeft: 8 },

  // Chips
  chipRow: { gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.bgInput,
  },
  chipActive: { borderColor: Colors.neonBlue, backgroundColor: 'rgba(0,212,255,0.1)' },
  chipText: { fontSize: 13, color: Colors.textSec, ...Fonts.medium },
  chipTextActive: { color: Colors.neonBlue },

  // Category
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catCard: {
    width: '31%', alignItems: 'center', paddingVertical: 14,
    borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.bgCard,
  },
  catCardActive: { borderColor: 'rgba(0,212,255,0.3)', backgroundColor: 'rgba(0,212,255,0.06)' },
  catName: { fontSize: 11, color: Colors.text, ...Fonts.semibold, marginTop: 4 },

  // Plan cards
  planCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  planIcon: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(0,212,255,0.08)', alignItems: 'center', justifyContent: 'center',
  },
  planTitle: { fontSize: 14, color: Colors.text, ...Fonts.semibold },
  planMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  planMetaText: { fontSize: 11, color: Colors.textSec },
  planMetaDot: { color: Colors.textMuted },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  diffText: { fontSize: 10, ...Fonts.semibold },

  // Empty
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  emptyTitle: { fontSize: 14, color: Colors.text, ...Fonts.semibold, marginTop: 8 },
  emptyText: { fontSize: 12, color: Colors.textSec, marginTop: 4 },
  clearFilter: { fontSize: 13, color: Colors.neonBlue, ...Fonts.semibold, marginTop: 12 },

  // Skeleton
  skeletonCard: {
    height: 72, borderRadius: Radius.lg,
    backgroundColor: Colors.bgInput, marginBottom: 8,
  },
});
