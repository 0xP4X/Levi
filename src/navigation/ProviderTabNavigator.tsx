
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ProviderDashboard from '../screens/ProviderDashboard';
import ProviderScheduleScreen from '../screens/ProviderScheduleScreen';
import ProviderEarningsScreen from '../screens/ProviderEarningsScreen';
import ProviderSettingsScreen from '../screens/ProviderSettingsScreen';

import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

const ProviderTabNavigator = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.cardBackground,
          borderTopColor: Colors.border,
          height: 90, 
          paddingBottom: 10, 
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarShowLabel: false,
        headerShown: false, // Headers will be managed by the parent StackNavigator
      }}
    >
      <Tab.Screen
        name="ProviderDashboard"
        component={ProviderDashboard}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProviderSchedule"
        component={ProviderScheduleScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProviderEarnings"
        component={ProviderEarningsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProviderSettings"
        component={ProviderSettingsScreen}
        initialParams={{ onLogout: onLogout }}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default ProviderTabNavigator;
