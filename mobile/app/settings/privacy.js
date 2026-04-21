import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius } from '../../lib/colors';
import GlassCard from '../../components/GlassCard';

export default function PrivacySettings() {
  const [form, setForm] = useState({ old: '', new: '', confirm: '' });

  const handleUpdatePassword = () => {
    if (!form.old || !form.new || !form.confirm) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (form.new !== form.confirm) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    Alert.alert('Success', 'Your password has been updated successfully.', [
      { text: 'OK', onPress: () => setForm({ old: '', new: '', confirm: '' }) }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Change Password</Text>
      <GlassCard style={styles.passCard}>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          placeholderTextColor={Colors.textMuted}
          secureTextEntry
          value={form.old}
          onChangeText={(v) => setForm((p) => ({ ...p, old: v }))}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor={Colors.textMuted}
          secureTextEntry
          value={form.new}
          onChangeText={(v) => setForm((p) => ({ ...p, new: v }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor={Colors.textMuted}
          secureTextEntry
          value={form.confirm}
          onChangeText={(v) => setForm((p) => ({ ...p, confirm: v }))}
        />
        <Pressable onPress={handleUpdatePassword}>
          <LinearGradient colors={Colors.gradientBlue} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.btnText}>Update Password</Text>
          </LinearGradient>
        </Pressable>
      </GlassCard>

      <Text style={styles.sectionLabel}>App Security</Text>
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Biometric App Lock</Text>
          <View style={styles.toggle}><View style={styles.toggleDot} /></View>
        </View>
        <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
          <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
          <View style={styles.toggle}><View style={styles.toggleDot} /></View>
        </View>
      </GlassCard>

      <Text style={styles.sectionLabel}>Danger Zone</Text>
      <GlassCard variant="sm" style={styles.dangerCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dangerTitle}>Delete Account</Text>
          <Text style={styles.dangerSub}>Permanently delete your data.</Text>
        </View>
        <Pressable onPress={() => Alert.alert('Are you sure?', 'This action cannot be undone. All your workouts and logs will be lost forever.', [{ text: 'Cancel', style: 'cancel'}, { text: 'Delete', style: 'destructive' }])}>
          <Text style={styles.dangerBtn}>Delete</Text>
        </Pressable>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 8 },
  passCard: { gap: 12 },
  input: { backgroundColor: Colors.bgInput, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 14, fontSize: 14, color: Colors.text },
  btn: { borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 14, ...Fonts.semibold },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingLabel: { fontSize: 14, color: Colors.text },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.textDim, justifyContent: 'center', paddingHorizontal: 2 },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  dangerCard: { flexDirection: 'row', alignItems: 'center', borderColor: 'rgba(239,68,68,0.3)', borderWidth: 1 },
  dangerTitle: { fontSize: 15, color: Colors.error, ...Fonts.semibold },
  dangerSub: { fontSize: 11, color: Colors.textSec, marginTop: 2 },
  dangerBtn: { color: Colors.error, fontSize: 14, ...Fonts.bold, padding: 8 },
});
