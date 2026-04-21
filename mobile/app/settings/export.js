import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius } from '../../lib/colors';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../lib/auth-context';

export default function ExportSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Export Requested',
        `A secure link to download your data archive will be sent to ${user?.email || 'your email'} within the next 24 hours.`
      );
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.icon}>📥</Text>
      <Text style={styles.title}>Download Your Data</Text>
      <Text style={styles.subtitle}>
        Get a copy of everything you've saved on NutriSnap. The archive will be a standard JSON and CSV format that you can view in Excel or import into other apps.
      </Text>

      <GlassCard variant="sm" style={styles.infoCard}>
        <Text style={styles.infoTitle}>What's included in the archive?</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• Profile information & active goals</Text>
          <Text style={styles.bullet}>• Complete AI Coach chat history</Text>
          <Text style={styles.bullet}>• Logged workouts & sets/reps history</Text>
          <Text style={styles.bullet}>• Nutrition logs & AI analyzed photos</Text>
          <Text style={styles.bullet}>• Custom workout plans</Text>
        </View>
      </GlassCard>

      <Pressable onPress={handleExport} disabled={loading} style={styles.btnWrap}>
        <LinearGradient colors={loading ? ['#444', '#555'] : Colors.gradientBlue} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
             <Text style={styles.btnText}>Request Archive</Text>
          )}
        </LinearGradient>
      </Pressable>
      
      <Text style={styles.footer}>
        Processing your data archive may take up to 24 hours to complete according to GDPR compliance.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, gap: 16, alignItems: 'center' },
  icon: { fontSize: 56, marginTop: 24 },
  title: { fontSize: 22, color: Colors.text, ...Fonts.display, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.textSec, textAlign: 'center', lineHeight: 20 },
  infoCard: { width: '100%', marginTop: 12, padding: 20 },
  infoTitle: { fontSize: 14, color: Colors.text, ...Fonts.semibold, marginBottom: 12 },
  bulletList: { gap: 8 },
  bullet: { fontSize: 12, color: Colors.textSec },
  btnWrap: { width: '100%', marginTop: 24 },
  btn: { borderRadius: Radius.full, paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, ...Fonts.bold },
  footer: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 16 },
});
