import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Colors, Fonts, Radius } from '../../lib/colors';
import GlassCard from '../../components/GlassCard';

export default function NotificationsSettings() {
  const [toggles, setToggles] = useState({
    'Workout Reminders': true,
    'AI Coach Daily Tips': true,
    'Goal Milestones': true,
    'Marketing & Offers': false,
  });

  const toggle = (key) => setToggles((p) => ({ ...p, [key]: !p[key] }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <GlassCard>
        <Text style={styles.desc}>
          Manage how you want to be notified. Your AI Coach will send you a personalized message daily if "AI Coach Daily Tips" is enabled.
        </Text>
      </GlassCard>

      <Text style={styles.sectionLabel}>Push Notifications</Text>
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        {Object.keys(toggles).map((key, i) => (
          <View
            key={key}
            style={[
              styles.settingRow,
              i < Object.keys(toggles).length - 1 && styles.settingDivider,
            ]}
          >
            <Text style={styles.settingLabel}>{key}</Text>
            <Pressable onPress={() => toggle(key)}>
              <View style={[styles.toggle, toggles[key] && styles.toggleOn]}>
                <View style={[styles.toggleDot, toggles[key] && styles.toggleDotOn]} />
              </View>
            </Pressable>
          </View>
        ))}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, gap: 16 },
  desc: { fontSize: 13, color: Colors.textSec, lineHeight: 20 },
  sectionLabel: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingLabel: { fontSize: 14, color: Colors.text },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.textDim, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: Colors.neonBlue },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleDotOn: { alignSelf: 'flex-end' },
});
