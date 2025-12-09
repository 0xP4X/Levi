import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function PrivacySecurityScreen({ navigation }: any) {
    const [faceIdEnabled, setFaceIdEnabled] = useState(false);
    const [locationSharing, setLocationSharing] = useState(true);
    const [dataSharing, setDataSharing] = useState(false);

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

    const renderActionRow = (label: string, iconName: any, onPress: () => void) => (
        <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={onPress}>
            <View style={styles.rowLeft}>
                <Ionicons name={iconName} size={20} color={Colors.textPrimary} />
                <Text style={styles.actionText}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
    );

    const renderSectionHeader = (title: string) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                {renderSectionHeader("Security")}
                <View style={styles.card}>
                    {renderToggleSetting("Face ID / Biometric Login", "Use your device's biometrics for quick login", faceIdEnabled, setFaceIdEnabled)}
                    <View style={styles.divider} />
                    {renderActionRow("Change Password", "lock-closed-outline", () => Alert.alert("Change Password", "Navigate to change password screen."))}
                    <View style={styles.divider} />
                    {renderActionRow("Two-Factor Authentication", "shield-checkmark-outline", () => Alert.alert("2FA", "Navigate to 2FA setup."))}
                </View>
            </View>

            <View style={styles.section}>
                {renderSectionHeader("Privacy")}
                <View style={styles.card}>
                    {renderToggleSetting("Share Location Data", "Allow app to use your location for job matching", locationSharing, setLocationSharing)}
                    <View style={styles.divider} />
                    {renderToggleSetting("Share Usage Data", "Help us improve by sharing anonymous usage data", dataSharing, setDataSharing)}
                    <View style={styles.divider} />
                    {renderActionRow("Manage Data Permissions", "document-text-outline", () => Alert.alert("Data Permissions", "Manage what data you share."))}
                </View>
            </View>

            <View style={styles.section}>
                {renderSectionHeader("Account Management")}
                <View style={styles.card}>
                    {renderActionRow("Deactivate Account", "person-remove-outline", () => Alert.alert("Deactivate Account", "Proceed to account deactivation."))}
                </View>
            </View>
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