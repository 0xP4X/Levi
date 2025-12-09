import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './src/constants/colors';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';

// App Flow Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';

// User Screens
import DiscoverScreen from './src/screens/DiscoverScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Provider Navigator
import ProviderStackNavigator from './src/navigation/ProviderStackNavigator';

// Admin Screens
import AdminDashboard from './src/screens/AdminDashboard';
import AdminUsersScreen from './src/screens/AdminUsersScreen';
import AdminReportsScreen from './src/screens/AdminReportsScreen';
import AdminSettingsScreen from './src/screens/AdminSettingsScreen';

const Tab = createBottomTabNavigator();

type UserRole = 'user' | 'provider' | 'admin';
type AppState = 'splash' | 'onboarding' | 'auth' | 'main';

// Custom Tab Bar Style
const screenOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 90,
    paddingBottom: 30,
    paddingTop: 10,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.textMuted,
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '600' as const,
    marginTop: 4,
    letterSpacing: 0.2,
  },
};

// --- User Navigation ---
function UserTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "compass" : "compass-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "bookmark" : "bookmark-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileScreen onLogout={onLogout} />}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={28} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// --- Admin Navigation ---
function AdminTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="AdminHome"
        component={AdminDashboard}
        options={{
          tabBarLabel: 'Metrics',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={AdminUsersScreen}
        options={{
          tabBarLabel: 'Users',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Abstract"
        component={AdminReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "warning" : "warning-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        children={() => <AdminSettingsScreen onLogout={onLogout} />}
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "shield-checkmark" : "shield-checkmark-outline"} size={26} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// --- Main App ---
export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [userRole, setUserRole] = useState<UserRole>('provider'); // Changed to 'provider' for testing

  const handleSplashFinish = () => {
    setAppState('onboarding');
  };

  const handleOnboardingFinish = () => {
    setAppState('auth');
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setAppState('main');
  };

  const handleLogout = () => {
    setAppState('auth');
    setUserRole('user');
  };

  if (appState === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (appState === 'onboarding') {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SafeAreaView style={styles.container}>
          <NavigationContainer>
            {appState === 'auth' ? (
              <AuthScreen onLogin={handleLogin} />
            ) : (
              <>
                {userRole === 'admin' && <AdminTabs onLogout={handleLogout} />}
                {userRole === 'provider' && <ProviderStackNavigator onLogout={handleLogout} />}
                {userRole === 'user' && <UserTabs onLogout={handleLogout} />}
              </>
            )}
          </NavigationContainer>
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});