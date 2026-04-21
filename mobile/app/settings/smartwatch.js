import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Colors, Fonts, Radius } from '../../lib/colors';
import GlassCard from '../../components/GlassCard';

const platforms = [
  { id: 'apple', name: 'Apple Health', icon: '🍎', connected: false },
  { id: 'google', name: 'Google Fit', icon: '🟢', connected: false },
  { id: 'garmin', name: 'Garmin Connect', icon: '⌚', connected: true },
  { id: 'fitbit', name: 'Fitbit', icon: '🏃', connected: false },
];

export default function SmartwatchSettings() {
  const [data, setData] = useState(platforms);
  const [loadingId, setLoadingId] = useState(null);

  const toggleConnect = (id) => {
    if (loadingId) return;
    setLoadingId(id);
    setTimeout(() => {
      setData((prev) => prev.map((p) => p.id === id ? { ...p, connected: !p.connected } : p));
      setLoadingId(null);
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <GlassCard>
        <Text style={styles.desc}>
          Sync your smartwatch or health app to automatically log your workouts, steps, and active calories burned into NutriSnap.
        </Text>
      </GlassCard>

      <Text style={styles.sectionLabel}>Available Integrations</Text>
      <View style={{ gap: 12 }}>
        {data.map((platform) => (
          <GlassCard key={platform.id} variant="sm" style={styles.platformCard}>
            <View style={styles.platformIconBox}>
              <Text style={{ fontSize: 24 }}>{platform.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.platformName}>{platform.name}</Text>
              <Text style={styles.platformStatus}>
                {platform.connected ? 'Connected' : 'Not Connected'}
              </Text>
            </View>
            <Pressable
              onPress={() => toggleConnect(platform.id)}
              style={[
                styles.connectBtn,
                platform.connected && styles.connectBtnActive,
              ]}
            >
              {loadingId === platform.id ? (
                <ActivityIndicator size="small" color={platform.connected ? Colors.error : Colors.neonBlue} />
              ) : (
                <Text style={[styles.connectBtnText, platform.connected && { color: Colors.error }]}>
                  {platform.connected ? 'Disconnect' : 'Connect'}
                </Text>
              )}
            </Pressable>
          </GlassCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, gap: 16 },
  desc: { fontSize: 13, color: Colors.textSec, lineHeight: 20 },
  sectionLabel: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 8 },
  platformCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  platformIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.bgInput, alignItems: 'center', justifyContent: 'center' },
  platformName: { fontSize: 15, color: Colors.text, ...Fonts.semibold },
  platformStatus: { fontSize: 11, color: Colors.textSec, marginTop: 2 },
  connectBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: 'rgba(0,212,255,0.1)' },
  connectBtnActive: { backgroundColor: 'rgba(239,68,68,0.1)' },
  connectBtnText: { color: Colors.neonBlue, fontSize: 12, ...Fonts.semibold },
});
