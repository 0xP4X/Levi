import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function NotificationSettingsScreen() {
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState(false);

    const [newJobAlerts, setNewJobAlerts] = useState(true);
    const [bookingUpdates, setBookingUpdates] = useState(true);
    const [payoutAlerts, setPayoutAlerts] = useState(true);
    const [reviewReminders, setReviewReminders] = useState(false);

    const renderToggleSetting = (label: string, description: string, value: boolean, onValueChange: (newValue: boolean) => void) => (
        <View style={styles.settingRow}>
            <View style={styles.settingTextCombined}>
                <Text style={styles.settingTitle}>{label}</Text>
                <Text style={styles.settingSub}>{description}</Text>
            </View>
            <Switch
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={'#FFF'}
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    );

    const renderSectionHeader = (title: string) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                {renderSectionHeader("Notification Channels")}
                <View style={styles.card}>
                    {renderToggleSetting("Push Notifications", "Receive alerts directly on your device", pushNotifications, setPushNotifications)}
                    <View style={styles.divider} />
                    {renderToggleSetting("Email Notifications", "Get updates in your inbox", emailNotifications, setEmailNotifications)}
                    <View style={styles.divider} />
                    {renderToggleSetting("SMS Notifications", "Receive text message alerts", smsNotifications, setSmsNotifications)}
                </View>
            </View>

            <View style={styles.section}>
                {renderSectionHeader("Alert Types")}
                <View style={styles.card}>
                    {renderToggleSetting("New Job Alerts", "Notify me of new job requests", newJobAlerts, setNewJobAlerts)}
                    <View style={styles.divider} />
                    {renderToggleSetting("Booking Updates", "Status changes, cancellations, etc.", bookingUpdates, setBookingUpdates)}
                    <View style={styles.divider} />
                    {renderToggleSetting("Payout Alerts", "Notifications about your earnings and payouts", payoutAlerts, setPayoutAlerts)}
                    <View style={styles.divider} />
                    {renderToggleSetting("Review Reminders", "Reminders to leave reviews for clients", reviewReminders, setReviewReminders)}
                </View>
            </View>

            <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
        paddingBottom: 40,
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
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
});