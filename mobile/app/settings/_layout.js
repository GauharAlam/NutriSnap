import { Stack } from 'expo-router';
import { Colors, Fonts } from '../../lib/colors';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: 'rgba(8,8,15,0.95)' },
        headerTintColor: Colors.text,
        headerTitleStyle: { ...Fonts.semibold, fontSize: 16 },
        contentStyle: { backgroundColor: Colors.bg },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="smartwatch" options={{ title: 'Smartwatch Sync' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy & Security' }} />
      <Stack.Screen name="export" options={{ title: 'Data & Export' }} />
      <Stack.Screen name="support" options={{ title: 'Help & Support' }} />
    </Stack>
  );
}
