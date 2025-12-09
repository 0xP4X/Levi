
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ProviderTabNavigator from './ProviderTabNavigator';
import ProviderProfileScreen from '../screens/ProviderProfileScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import PayoutsScreen from '../screens/PayoutsScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import ServiceManagementScreen from '../screens/ServiceManagementScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import SavedAddressesScreen from '../screens/SavedAddressesScreen';

import { Colors } from '../constants/colors';
import { styles } from './styles';

const Stack = createStackNavigator();

const getHeaderTitle = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'ProviderDashboard';

  switch (routeName) {
    case 'ProviderDashboard':
      return 'Overview';
    case 'ProviderSchedule':
      return 'Schedule';
    case 'ProviderEarnings':
      return 'Earnings';
    case 'ProviderSettings':
      return 'Settings';
    default:
      return routeName; // Fallback for other screens
  }
};

const ProviderStackNavigator = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProviderRoot"
        options={({ route, navigation }) => ({
          header: () => {
            const title = getHeaderTitle(route);
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'ProviderDashboard';
            const userName = route.params?.userName || 'Partner'; // Get userName from route params

            return (
              <View style={styles.header}>
                <View>
                  {routeName === 'ProviderDashboard' ? (
                    <>
                      <Text style={styles.greeting}>Hello, {userName}</Text>
                      <Text style={styles.date}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                    </>
                  ) : (
                    <Text style={styles.headerTitle}>{title}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('ProviderProfile')}>
                  <Ionicons name="person-circle-outline" size={40} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            );
          },
        })}
      >
        {(props) => <ProviderTabNavigator {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name="ProviderProfile"
        component={ProviderProfileScreen}
        options={{ title: 'Your Profile', headerStyle: styles.header, headerTitleStyle: styles.headerTitle }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job Details' }}
      />
      <Stack.Screen
        name="Payouts"
        component={PayoutsScreen}
        options={{ title: 'Payouts & Banking' }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ title: 'Reviews & Ratings' }}
      />
      <Stack.Screen
        name="ServiceManagement"
        component={ServiceManagementScreen}
        options={{ title: 'Manage Services' }}
      />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} options={{ title: 'Privacy & Security' }} />
      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} options={{ title: 'Saved Addresses' }} />
    </Stack.Navigator>
  );
};

export default ProviderStackNavigator;
