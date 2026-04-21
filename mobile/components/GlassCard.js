import { View, StyleSheet, Pressable } from 'react-native';
import { Colors, Radius } from '../lib/colors';

/**
 * Glass-morphism card matching the web app's glass-card styling.
 * Pass `onPress` to make it tappable.
 */
export default function GlassCard({
  children,
  style,
  onPress,
  variant = 'default', // 'default' | 'sm' | 'accent'
}) {
  const cardStyle = [
    styles.base,
    variant === 'sm' && styles.sm,
    variant === 'accent' && styles.accent,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  sm: {
    borderRadius: Radius.lg,
    padding: 16,
  },
  accent: {
    borderColor: Colors.borderAccent,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
