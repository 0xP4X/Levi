import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface ProviderSettingsScreenProps {
    navigation: any;
    route: any; // Add route prop to access params
}

export default function ProviderSettingsScreen({ navigation, route }: ProviderSettingsScreenProps) {
    const { onLogout } = route.params; // Access onLogout from route.params

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [autoAvail, setAutoAvail] = useState(false);

    const toggleNotifications = () => setNotificationsEnabled(previousState => !previousState);
    const toggleAutoAvail = () => setAutoAvail(previousState => !previousState);

    const renderSectionHeader = (title: string) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Preferences */}
            <View style={styles.section}>
                {renderSectionHeader("Preferences")}
                <View style={styles.card}>
                    <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={() => navigation.navigate('NotificationSettings')}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
                            <Text style={styles.actionText}>Notification Settings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <View style={styles.settingRow}>
                        <View style={styles.settingTextCombined}>
                            <Text style={styles.settingTitle}>Auto-Availability</Text>
                            <Text style={styles.settingSub}>Set available during work hours</Text>
                        </View>
                        <Switch
                            trackColor={{ false: Colors.border, true: Colors.available }}
                            thumbColor={'#FFF'}
                            onValueChange={toggleAutoAvail}
                            value={autoAvail}
                        />
                    </View>
                </View>
            </View>

            {/* Service Management */}
            <View style={styles.section}>
                {renderSectionHeader("Services")}
                <View style={styles.card}>
                    <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={() => navigation.navigate('ServiceManagement')}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="briefcase-outline" size={20} color={Colors.textPrimary} />
                            <Text style={styles.actionText}>Manage My Services</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={() => navigation.navigate('SavedAddresses')}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="location-outline" size={20} color={Colors.textPrimary} />
                            <Text style={styles.actionText}>Saved Addresses</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Account Actions */}
            <View style={styles.section}>
                {renderSectionHeader("Account")}
                <View style={styles.card}>
                    <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={() => navigation.navigate('Payouts')}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="card-outline" size={20} color={Colors.textPrimary} />
                            <Text style={styles.actionText}>Payment Methods</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={() => navigation.navigate('PrivacySecurity')}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textPrimary} />
                            <Text style={styles.actionText}>Security & Privacy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={() => Linking.openURL('https://support.example.com')}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="help-circle-outline" size={20} color={Colors.textPrimary} />
                            <Text style={styles.actionText}>Help & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.actionRow}
                        activeOpacity={0.7}
                        onPress={onLogout}
                    >
                        <View style={styles.rowLeft}>
                            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                            <Text style={[styles.actionText, { color: Colors.error }]}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
        paddingBottom: 120, // Adjusted for floating tab bar
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 12,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    settingTextCombined: {
        flex: 1,
        marginRight: 16,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    settingSub: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
});
