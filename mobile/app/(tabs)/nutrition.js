import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Modal,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../lib/api';
import { Colors, Fonts, Radius } from '../../lib/colors';
import CircleProgress from '../../components/CircleProgress';
import GlassCard from '../../components/GlassCard';

/* ─── Macro Progress Bar ─── */
function MacroBar({ value, max, color, label }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={macroStyles.container}>
      <View style={macroStyles.top}>
        <Text style={macroStyles.label}>{label}</Text>
        <Text style={macroStyles.valueText}>{value}g / {max}g</Text>
      </View>
      <View style={macroStyles.track}>
        <LinearGradient
          colors={color}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[macroStyles.fill, { width: `${pct}%` }]}
        />
      </View>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  container: { gap: 6 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, color: Colors.textSec, ...Fonts.medium },
  valueText: { fontSize: 11, color: Colors.textMuted },
  track: {
    height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
});

export default function NutritionScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState([]);
  const [goalTargets, setGoalTargets] = useState({ calories: 2400, protein: 170, carbs: 250, fats: 75 });
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);

  // AI flow
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [uploadedImagePath, setUploadedImagePath] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [mealsRes, goalsRes, workoutRes] = await Promise.all([
        apiClient.get('/meals'),
        apiClient.get('/goals'),
        apiClient.get('/workouts'),
      ]);
      if (mealsRes.data?.success) setMeals(mealsRes.data.data.meals || []);
      if (goalsRes.data?.success && goalsRes.data.data?.dailyTargets) {
        const t = goalsRes.data.data.dailyTargets;
        setGoalTargets({ calories: t.calories || 2400, protein: t.protein || 170, carbs: t.carbs || 250, fats: t.fats || 75 });
      }
      if (workoutRes.data?.success) {
        setCaloriesBurned(workoutRes.data.data.stats?.totalCalories || 0);
      }
    } catch (err) {
      console.log('Nutrition data error:', err.message);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalConsumed = useMemo(() => ({
    calories: meals.reduce((a, m) => a + (m.nutrition?.calories || 0), 0),
    protein: meals.reduce((a, m) => a + (m.nutrition?.protein || 0), 0),
    carbs: meals.reduce((a, m) => a + (m.nutrition?.carbs || 0), 0),
    fats: meals.reduce((a, m) => a + (m.nutrition?.fats || 0), 0),
  }), [meals]);

  async function handleImagePick(source) {
    let perm;
    if (source === 'camera') {
      perm = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    
    if (!perm.granted) {
      Alert.alert('Permission needed', `Access to ${source} is required to scan food.`);
      return;
    }

    const options = {
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    };

    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (result.canceled) return;

    const asset = result.assets[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'food_photo.jpg',
      });

      const { data: uploadRes } = await apiClient.post('/meals/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { imagePath, imageUrl, originalName } = uploadRes.data;
      setUploadedImagePath(imagePath);
      setUploadedImageUrl(imageUrl);

      setIsUploading(false);
      setIsAnalyzing(true);
      setShowModal(true);

      const { data: analyzeRes } = await apiClient.post('/meals/analyze-image', {
        imagePath, imageUrl, originalName,
      });
      setAiAnalysis(analyzeRes.data);
    } catch (err) {
      console.log('AI flow error:', err.message);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
      setShowModal(false);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  }

  async function confirmMeal() {
    if (!aiAnalysis) return;
    try {
      await apiClient.post('/meals', {
        title: aiAnalysis.analysis.title,
        mealType: aiAnalysis.analysis.mealType,
        foodItems: aiAnalysis.analysis.foodItems.map((f) => f.name),
        notes: aiAnalysis.analysis.notes,
        eatenAt: new Date().toISOString(),
        imagePath: uploadedImagePath,
        imageUrl: uploadedImageUrl,
        nutrition: {
          calories: aiAnalysis.nutritionEstimate.calories,
          protein: aiAnalysis.nutritionEstimate.protein,
          carbs: aiAnalysis.nutritionEstimate.carbs,
          fats: aiAnalysis.nutritionEstimate.fats,
          sugar: Math.round(aiAnalysis.nutritionEstimate.carbs * 0.2),
        },
        source: 'ai_estimated',
      });
      setShowModal(false);
      setAiAnalysis(null);
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to save meal.');
    }
  }

  const mealIcon = (type) => {
    const icons = { breakfast: '🥣', lunch: '🥗', dinner: '🥩', snack: '🍎' };
    return icons[type] || '🍽️';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.sectionLabel}>Nutrition</Text>
        <Text style={styles.sectionTitle}>Daily Fuel</Text>

        {/* Calories Overview */}
        <GlassCard>
          <View style={styles.calRow}>
            <CircleProgress
              value={totalConsumed.calories}
              max={goalTargets.calories}
              size={110}
              strokeWidth={8}
              color={Colors.neonOrange}
              label="kcal"
            />
            <View style={{ flex: 1, marginLeft: 20 }}>
              <Text style={styles.remainLabel}>Remaining</Text>
              <Text style={styles.remainValue}>
                {goalTargets.calories - totalConsumed.calories}{' '}
                <Text style={styles.remainUnit}>kcal</Text>
              </Text>
              <View style={styles.calStats}>
                {[
                  { label: 'Eaten', value: totalConsumed.calories, color: Colors.neonOrange },
                  { label: 'Burned', value: caloriesBurned, color: Colors.neonPink },
                  { label: 'Net', value: totalConsumed.calories - caloriesBurned, color: Colors.neonGreen },
                ].map((s) => (
                  <View key={s.label} style={styles.calStatItem}>
                    <Text style={[styles.calStatVal, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.calStatLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Macros */}
        <GlassCard style={{ gap: 14 }}>
          <Text style={styles.cardTitle}>Macro Tracking</Text>
          <MacroBar value={totalConsumed.protein} max={goalTargets.protein} color={Colors.gradientBlue} label="Protein" />
          <MacroBar value={totalConsumed.carbs} max={goalTargets.carbs} color={['#f97316', '#eab308']} label="Carbs" />
          <MacroBar value={totalConsumed.fats} max={goalTargets.fats} color={Colors.gradientPink} label="Fats" />
        </GlassCard>

        {/* Water */}
        <GlassCard>
          <View style={styles.waterHeader}>
            <View>
              <Text style={styles.cardTitle}>Water Reminder</Text>
              <Text style={styles.waterSub}>{waterGlasses}/8 glasses today</Text>
            </View>
            <View style={styles.waterIconBox}>
              <Text style={{ fontSize: 20 }}>💧</Text>
            </View>
          </View>
          <View style={styles.waterGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Pressable
                key={i}
                onPress={() => setWaterGlasses(i + 1)}
                style={[styles.waterBlock, i < waterGlasses && styles.waterBlockFilled]}
              />
            ))}
          </View>
        </GlassCard>

        {/* Action Buttons Hub */}
        <View style={styles.actionHub}>
          <Pressable 
            onPress={() => router.push('/barcode-scanner')} 
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
          >
            <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']} style={styles.actionBtnGrad}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>🧾</Text>
              <Text style={styles.actionBtnTxt}>Scan</Text>
              <Text style={styles.actionBtnTxt}>Barcode</Text>
            </LinearGradient>
          </Pressable>

          <Pressable 
            onPress={() => handleImagePick('camera')} 
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
          >
            <LinearGradient colors={Colors.gradientBlue} style={styles.actionBtnGrad} start={{x:0, y:0}} end={{x:1, y:1}}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>📸</Text>
              <Text style={styles.actionBtnTxt}>AI Camera</Text>
              <Text style={[styles.actionBtnTxt, { color: 'rgba(255,255,255,0.7)', fontSize: 10 }]}>Take photo</Text>
            </LinearGradient>
          </Pressable>

          <Pressable 
            onPress={() => handleImagePick('gallery')} 
            style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
          >
            <LinearGradient colors={Colors.gradientPink} style={styles.actionBtnGrad} start={{x:0, y:0}} end={{x:1, y:1}}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>🖼️</Text>
              <Text style={styles.actionBtnTxt}>AI Gallery</Text>
              <Text style={[styles.actionBtnTxt, { color: 'rgba(255,255,255,0.7)', fontSize: 10 }]}>Upload photo</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Meals */}
        <View style={[styles.mealHeader, { marginTop: 16 }]}>
          <Text style={styles.sectionLabel}>Today's Meals</Text>
        </View>
        
        {isUploading && (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
             <ActivityIndicator size="small" color={Colors.neonBlue} />
             <Text style={{ color: Colors.neonBlue, marginTop: 8, fontSize: 12 }}>Processing image...</Text>
          </View>
        )}

        {meals.length === 0 ? (
          <GlassCard style={styles.emptyMeals}>
            <Text style={styles.emptyText}>No meals logged today. Snap a photo!</Text>
          </GlassCard>
        ) : (
          meals.map((meal) => (
            <GlassCard key={meal._id} variant="sm" style={styles.mealCard}>
              {meal.imageUrl ? (
                <Image source={{ uri: meal.imageUrl }} style={styles.mealIconBox} />
              ) : (
                <View style={styles.mealIconBox}>
                  <Text style={{ fontSize: 24 }}>{mealIcon(meal.mealType)}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.mealTitleRow}>
                  <Text style={styles.mealTitle} numberOfLines={1}>{meal.title}</Text>
                  <View style={styles.checkIcon}>
                    <Text style={{ fontSize: 8, color: Colors.neonGreen }}>✓</Text>
                  </View>
                </View>
                <Text style={styles.mealType}>{meal.mealType}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.mealCal}>{meal.nutrition.calories}</Text>
                <Text style={styles.mealCalUnit}>kcal</Text>
              </View>
            </GlassCard>
          ))
        )}

        {/* Tip */}
        <GlassCard variant="accent">
          <View style={styles.tipHeader}>
            <Text style={{ fontSize: 20 }}>🥦</Text>
            <Text style={styles.cardTitle}>Nutrition Tip</Text>
          </View>
          <Text style={styles.tipText}>
            {totalConsumed.protein < goalTargets.protein
              ? `You're ${goalTargets.protein - totalConsumed.protein}g away from your protein goal. Consider adding a post-workout shake or Greek yogurt.`
              : totalConsumed.calories > goalTargets.calories
                ? `You've exceeded your calorie target by ${totalConsumed.calories - goalTargets.calories} kcal. Consider lighter meals.`
                : "Great job! You're on track with your nutrition goals today. Keep it up! 💪"}
          </Text>
        </GlassCard>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* AI Analysis Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable onPress={() => setShowModal(false)} style={styles.modalClose}>
              <Text style={{ color: Colors.textSec, fontSize: 18 }}>✕</Text>
            </Pressable>
            <Text style={styles.modalTitle}>NutriSnap AI ⚡</Text>

            {isAnalyzing ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Colors.neonBlue} />
                <Text style={styles.modalLoadingText}>Analyzing your meal...</Text>
              </View>
            ) : aiAnalysis ? (
              <View style={{ gap: 14 }}>
                {uploadedImageUrl && (
                  <Image source={{ uri: uploadedImageUrl }} style={styles.modalImage} />
                )}
                <Text style={styles.modalMealTitle}>{aiAnalysis.analysis.title}</Text>
                <Text style={styles.modalMealSub}>
                  {aiAnalysis.analysis.mealType} • {aiAnalysis.analysis.foodItems.map((f) => f.name).join(', ')}
                </Text>

                <View style={styles.macroGrid}>
                  {[
                    { label: 'Cal', value: aiAnalysis.nutritionEstimate.calories, color: Colors.neonOrange },
                    { label: 'Pro', value: `${aiAnalysis.nutritionEstimate.protein}g`, color: Colors.neonBlue },
                    { label: 'Carb', value: `${aiAnalysis.nutritionEstimate.carbs}g`, color: Colors.neonGreen },
                    { label: 'Fat', value: `${aiAnalysis.nutritionEstimate.fats}g`, color: Colors.neonPink },
                  ].map((m) => (
                    <View key={m.label} style={styles.macroItem}>
                      <Text style={styles.macroItemLabel}>{m.label}</Text>
                      <Text style={[styles.macroItemVal, { color: m.color }]}>{m.value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{aiAnalysis.analysis.notes}</Text>
                </View>

                <Pressable onPress={confirmMeal}>
                  <LinearGradient
                    colors={Colors.gradientBlue}
                    style={styles.confirmBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.confirmText}>Confirm & Log Meal</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },

  sectionLabel: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, letterSpacing: 1.5, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 22, color: Colors.text, ...Fonts.display, marginTop: 2, marginBottom: 4 },
  cardTitle: { fontSize: 14, color: Colors.text, ...Fonts.semibold },

  // Calories
  calRow: { flexDirection: 'row', alignItems: 'center' },
  remainLabel: { fontSize: 11, color: Colors.textSec },
  remainValue: { fontSize: 24, color: Colors.text, ...Fonts.bold, marginTop: 2 },
  remainUnit: { fontSize: 13, color: Colors.textSec, ...Fonts.regular },
  calStats: { flexDirection: 'row', gap: 12, marginTop: 10 },
  calStatItem: { alignItems: 'center' },
  calStatVal: { fontSize: 14, ...Fonts.bold },
  calStatLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },

  // Water
  waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  waterSub: { fontSize: 12, color: Colors.textSec, marginTop: 2 },
  waterIconBox: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: 'rgba(0,212,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  waterGrid: { flexDirection: 'row', gap: 6 },
  waterBlock: {
    flex: 1, height: 32, borderRadius: 8,
    backgroundColor: Colors.bgInput,
  },
  waterBlockFilled: { backgroundColor: Colors.neonBlue },

  // Action Hub
  actionHub: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, borderRadius: Radius.lg, overflow: 'hidden' },
  actionBtnGrad: { 
    paddingVertical: 16, paddingHorizontal: 4, 
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.lg 
  },
  actionBtnTxt: { color: '#fff', fontSize: 12, ...Fonts.semibold, textAlign: 'center' },

  // Meals
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  emptyMeals: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 13, color: Colors.textSec },
  mealCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  mealIconBox: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center',
  },
  mealTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mealTitle: { fontSize: 14, color: Colors.text, ...Fonts.semibold, flex: 1 },
  checkIcon: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  mealType: { fontSize: 11, color: Colors.textSec, textTransform: 'capitalize', marginTop: 2 },
  mealCal: { fontSize: 14, color: Colors.text, ...Fonts.bold },
  mealCalUnit: { fontSize: 10, color: Colors.textMuted },

  // Tip
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tipText: { fontSize: 12, color: Colors.textSec, lineHeight: 18 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: Colors.bgOverlay,
    justifyContent: 'flex-end', padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.bgCardSolid,
    borderRadius: 32, borderWidth: 1,
    borderColor: Colors.borderLight, padding: 24,
  },
  modalClose: { position: 'absolute', top: 16, right: 16, zIndex: 1, padding: 8 },
  modalTitle: { fontSize: 18, color: Colors.text, ...Fonts.display, marginBottom: 16 },
  modalLoading: { alignItems: 'center', paddingVertical: 40, gap: 16 },
  modalLoadingText: { fontSize: 14, color: Colors.textSec },
  modalImage: { width: '100%', height: 140, borderRadius: Radius.lg },
  modalMealTitle: { fontSize: 18, color: Colors.text, ...Fonts.bold },
  modalMealSub: { fontSize: 12, color: Colors.textSec, textTransform: 'capitalize' },
  macroGrid: {
    flexDirection: 'row', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.lg, padding: 12,
  },
  macroItem: { flex: 1, alignItems: 'center' },
  macroItemLabel: { fontSize: 11, color: Colors.textMuted },
  macroItemVal: { fontSize: 14, ...Fonts.bold, marginTop: 4 },
  notesBox: {
    backgroundColor: Colors.bgInput, borderRadius: Radius.md,
    padding: 12, borderLeftWidth: 2, borderLeftColor: Colors.neonBlue,
  },
  notesText: { fontSize: 11, color: Colors.textSec, fontStyle: 'italic', lineHeight: 16 },
  confirmBtn: { borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 14, ...Fonts.bold },
});
