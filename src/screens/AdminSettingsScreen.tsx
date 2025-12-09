import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';


interface AdminSettingsScreenProps {
    onLogout: () => void;
}

export default function AdminSettingsScreen({ onLogout }: AdminSettingsScreenProps) {

    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [newRegistrations, setNewRegistrations] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);

    const renderSectionHeader = (title: string) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    const renderToggle = (label: string, sub: string, value: boolean, onValueChange: () => void, isDestructive = false) => (
        <View style={styles.settingRow}>
            <View style={styles.textCol}>
                <Text style={[styles.settingLabel, isDestructive && styles.destructiveText]}>{label}</Text>
                <Text style={styles.settingSub}>{sub}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: Colors.border, true: isDestructive ? Colors.error : Colors.available }}
                thumbColor={'#FFF'}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* System Status */}
                <View style={styles.statusCard}>
                    <View style={styles.statusRow}>
                        <View style={styles.statusIndicator}>
                            <View style={[styles.pulseDot, { backgroundColor: maintenanceMode ? Colors.warning : Colors.success }]} />
                        </View>
                        <View>
                            <Text style={styles.statusTitle}>System Status: {maintenanceMode ? 'Maintenance' : 'Operational'}</Text>
                            <Text style={styles.statusSub}>v1.0.0 • Uptime 99.9%</Text>
                        </View>
                    </View>
                </View>

                {/* General Controls */}
                <View style={styles.section}>
                    {renderSectionHeader("General Controls")}
                    <View style={styles.card}>
                        {renderToggle(
                            "Allow New Registrations",
                            "Users and providers can sign up",
                            newRegistrations,
                            () => setNewRegistrations(!newRegistrations)
                        )}
                        <View style={styles.divider} />
                        {renderToggle(
                            "Admin Email Alerts",
                            "Receive critical system notifications",
                            emailAlerts,
                            () => setEmailAlerts(!emailAlerts)
                        )}
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    {renderSectionHeader("Danger Zone")}
                    <View style={[styles.card, styles.dangerCard]}>
                        {renderToggle(
                            "Maintenance Mode",
                            "Suspend all user activity immediately",
                            maintenanceMode,
                            () => setMaintenanceMode(!maintenanceMode),
                            true
                        )}
                    </View>
                </View>

                {/* System Logs */}
                <View style={styles.section}>
                    {renderSectionHeader("System Logs")}
                    <View style={styles.card}>
                        {['Audit Logs', 'Error Logs', 'Performance Stats'].map((item, index) => (
                            <React.Fragment key={item}>
                                <TouchableOpacity style={styles.linkRow}>
                                    <Text style={styles.linkText}>{item}</Text>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                </TouchableOpacity>
                                {index < 2 && <View style={styles.divider} />}
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    {renderSectionHeader("Account")}
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.linkRow}
                            activeOpacity={0.7}
                            onPress={onLogout}
                        >
                            <Text style={[styles.linkText, { color: Colors.error }]}>Sign Out</Text>
                            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 0,
        paddingBottom: 16,
        backgroundColor: Colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    content: {
        padding: 16,
    },
    statusCard: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 24,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surfaceBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    pulseDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    statusSub: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
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
    dangerCard: {
        borderColor: Colors.error + '40',
        backgroundColor: Colors.error + '05',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    textCol: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    destructiveText: {
        color: Colors.error,
    },
    settingSub: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 12,
    },
    linkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    linkText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
});
