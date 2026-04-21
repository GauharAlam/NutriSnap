import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius } from '../../lib/colors';
import GlassCard from '../../components/GlassCard';

const faqs = [
  { q: "How does the AI Coach work?", a: "The AI Coach analyzes your logged workouts and meals to provide personalized feedback. It can also estimate macros from photos of your food." },
  { q: "Can I connect my Apple Watch?", a: "Yes! Currently in testing, you can connect your Apple Health data in the Smartwatch Sync settings." },
  { q: "How do I edit a logged workout?", a: "Go to the Progress tab, tap 'View All Activity', and select the workout to edit its details." },
];

export default function SupportSettings() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
      <View style={{ gap: 8 }}>
        {faqs.map((faq, i) => (
          <GlassCard key={i} variant="sm" style={{ padding: 0, overflow: 'hidden' }}>
            <Pressable onPress={() => setOpenIndex(openIndex === i ? null : i)} style={styles.faqHeader}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <Text style={styles.faqIcon}>{openIndex === i ? '−' : '+'}</Text>
            </Pressable>
            {openIndex === i && (
              <View style={styles.faqBody}>
                <Text style={styles.faqA}>{faq.a}</Text>
              </View>
            )}
          </GlassCard>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Need more help?</Text>
      <GlassCard variant="sm" style={styles.contactCard}>
        <Text style={{ fontSize: 32 }}>💌</Text>
        <Text style={styles.contactTitle}>Contact Support</Text>
        <Text style={styles.contactSub}>Our team usually responds within 24 hours.</Text>
        
        <Pressable onPress={() => Linking.openURL('mailto:support@nutrisnap.com')} style={{ width: '100%' }}>
          <LinearGradient colors={Colors.gradientBlue} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.btnText}>Write us an email</Text>
          </LinearGradient>
        </Pressable>
      </GlassCard>

      <Text style={styles.version}>NutriSnap v2.1.0 (Build 302)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 10, color: Colors.textSec, ...Fonts.semibold, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 8 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  faqQ: { fontSize: 14, color: Colors.text, ...Fonts.medium, flex: 1 },
  faqIcon: { fontSize: 20, color: Colors.textSec, marginLeft: 8 },
  faqBody: { paddingHorizontal: 16, paddingBottom: 16 },
  faqA: { fontSize: 12, color: Colors.textSec, lineHeight: 18 },
  contactCard: { alignItems: 'center', padding: 24, paddingBottom: 20 },
  contactTitle: { fontSize: 18, color: Colors.text, ...Fonts.semibold, marginTop: 8 },
  contactSub: { fontSize: 12, color: Colors.textSec, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  btn: { borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 14, ...Fonts.bold },
  version: { textAlign: 'center', fontSize: 11, color: Colors.textMuted, marginTop: 12 },
});
