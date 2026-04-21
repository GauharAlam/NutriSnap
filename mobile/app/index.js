import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/auth-context';
import { Colors, Fonts } from '../lib/colors';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Entry screen — shows a branded splash while checking auth,
 * then redirects to tabs (authenticated) or login (guest).
 */
export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping } = useAuth();

  useEffect(() => {
    if (isBootstrapping) return;
    // Use replace so user can't swipe back to this screen
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, [isBootstrapping, isAuthenticated]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,212,255,0.08)', 'rgba(168,85,247,0.05)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.logoBox}>
        <LinearGradient
          colors={Colors.gradientBlue}
          style={styles.logoGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoIcon}>⚡</Text>
        </LinearGradient>
      </View>
      <Text style={styles.title}>
        Nutri<Text style={styles.titleAccent}>Snap</Text>
      </Text>
      <Text style={styles.subtitle}>AI-Powered Fitness</Text>
      <ActivityIndicator
        size="small"
        color={Colors.neonBlue}
        style={{ marginTop: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 34,
    color: Colors.text,
    ...Fonts.display,
  },
  titleAccent: {
    color: Colors.neonBlue,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSec,
    marginTop: 4,
    ...Fonts.medium,
  },
});
