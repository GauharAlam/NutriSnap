import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../lib/colors';

const TAB_ITEMS = [
  { name: 'index',     title: 'Home',      icon: 'home' },
  { name: 'workouts',  title: 'Workouts',  icon: 'barbell' },
  { name: 'nutrition', title: 'Nutrition',  icon: 'nutrition' },
  { name: 'progress',  title: 'Progress',  icon: 'stats-chart' },
  { name: 'profile',   title: 'Profile',   icon: 'person' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.neonBlue,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIcon : undefined}>
                <Ionicons
                  name={focused ? tab.icon : `${tab.icon}-outline`}
                  size={22}
                  color={color}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(8,8,15,0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 10,
    ...Fonts.semibold,
    marginTop: 2,
  },
  tabItem: {
    gap: 2,
  },
  activeIcon: {
    backgroundColor: 'rgba(0,212,255,0.12)',
    borderRadius: 12,
    padding: 4,
    paddingHorizontal: 12,
  },
});
