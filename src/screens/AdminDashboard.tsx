import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Booking } from '../types';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

// --- Mock SIEM Data ---
const LIVE_TRAFFIC = [
    { id: '1', ip: '192.168.1.104', action: 'POST /auth/login', status: 200, time: '10:42:01', risk: 'low' },
    { id: '2', ip: '45.22.19.112', action: 'GET /api/v1/users', status: 403, time: '10:41:58', risk: 'high' },
    { id: '3', ip: '10.0.0.5', action: 'POST /booking/create', status: 201, time: '10:41:45', risk: 'low' },
    { id: '4', ip: '198.51.100.2', action: 'SQL_INJECT_ATTEMPT', status: 418, time: '10:41:12', risk: 'critical' },
    { id: '5', ip: '172.16.254.1', action: 'GET /provider/list', status: 200, time: '10:40:55', risk: 'low' },
];

const SECURITY_ALERTS = [
    { id: '1', title: 'Suspicious Payload Detected', location: 'Frankfurt, DE', level: 'Critical' },
    { id: '2', title: 'Multiple Failed Auth Attempts', location: 'Unknown IP', level: 'High' },
];

export default function AdminDashboard() {
    const [threatLevel, setThreatLevel] = useState('Low');
    const [serverLoad, setServerLoad] = useState(34);
    const [activeSessions, setActiveSessions] = useState(1243);
    const [refreshing, setRefreshing] = useState(false);
    const [liveTraffic, setLiveTraffic] = useState(LIVE_TRAFFIC);
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

    // Simulated live update effect
    useEffect(() => {
        loadRealData();

        const interval = setInterval(() => {
            setServerLoad(prev => {
                const change = Math.random() > 0.5 ? 2 : -2;
                return Math.min(100, Math.max(20, prev + change));
            });

            // Add new traffic logs periodically
            if (Math.random() > 0.7) {
                const newLog = {
                    id: Date.now().toString(),
                    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                    action: Math.random() > 0.5 ? 'GET /api/data' : 'POST /auth/token',
                    status: Math.random() > 0.8 ? 401 : 200,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    risk: Math.random() > 0.9 ? 'high' : 'low'
                };

                setLiveTraffic(prev => [newLog, ...prev.slice(0, 9)]);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const loadRealData = async () => {
        try {
            const bookings = await api.getUserBookings('all');
            setRecentBookings(bookings.slice(0, 5));
        } catch (error) {
            console.warn("Failed to load admin bookings", error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate refresh
        setTimeout(() => {
            setRefreshing(false);
            Alert.alert('Refreshed', 'Dashboard data updated');
        }, 1000);
    };

    const handleInvestigateAlert = (alert: typeof SECURITY_ALERTS[0]) => {
        Alert.alert(
            'Security Alert Investigation',
            `Investigating: ${alert.title}\nLocation: ${alert.location}\nThreat Level: ${alert.level}`,
            [
                { text: 'Ignore', style: 'cancel' },
                {
                    text: 'Block IP',
                    onPress: () => Alert.alert('IP Blocked', 'Malicious IP address has been blocked')
                },
                {
                    text: 'Full Report',
                    onPress: () => Alert.alert('Report Generated', 'Detailed security report has been generated and sent to your email')
                }
            ]
        );
    };

    const handleResolveAlert = (alert: typeof SECURITY_ALERTS[0]) => {
        Alert.alert(
            'Resolve Alert',
            `Mark "${alert.title}" as resolved?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Resolve',
                    style: 'destructive',
                    onPress: () => Alert.alert('Alert Resolved', 'Security alert has been marked as resolved')
                }
            ]
        );
    };

    const renderMetricCard = (title: string, value: string, sub: string, icon: string, color: string) => (
        <View style={styles.metricCard}>
            <View style={[styles.metricHeader, { borderBottomColor: color }]}>
                <Ionicons name={icon as any} size={18} color={color} />
                <Text style={[styles.metricTitle, { color }]}>{title}</Text>
            </View>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricSub}>{sub}</Text>
        </View>
    );

    const renderLogItem = ({ item }: { item: typeof LIVE_TRAFFIC[0] }) => (
        <View style={styles.logRow}>
            <Text style={styles.logTime}>{item.time}</Text>
            <Text style={styles.logIP}>{item.ip}</Text>
            <Text style={styles.logAction} numberOfLines={1}>{item.action}</Text>
            <View style={[
                styles.riskBadge,
                item.risk === 'critical' ? styles.riskCrit :
                    item.risk === 'high' ? styles.riskHigh : styles.riskLow
            ]}>
                <Text style={styles.riskText}>{item.status}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.commandTitle}>Admin Dashboard</Text>
            </View>

            {/* Top Command Bar */}
            <View style={styles.commandBar}>
                <View>
                    <Text style={styles.commandTitle}>SIEM Command Center</Text>
                    <Text style={styles.commandSub}>System Integrity Monitoring Active</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={onRefresh}
                >
                    <Ionicons name="refresh" size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
            >

                {/* Threat Level Indicator */}
                <View style={styles.threatSection}>
                    <View style={styles.threatHeader}>
                        <Ionicons name="shield-checkmark" size={24} color={Colors.success} />
                        <Text style={styles.threatTitle}>Global Threat Level</Text>
                    </View>
                    <View style={styles.threatMeter}>
                        {['Low', 'Elevated', 'High', 'Critical'].map((level, index) => {
                            const active = level === threatLevel; // Fixed to Low
                            // Mock logic for colors:
                            const colors = [Colors.success, Colors.warning, Colors.error, '#991B1B']; // #991B1B is dark red
                            const color = colors[index];
                            return (
                                <View key={level} style={[
                                    styles.threatLevel,
                                    { backgroundColor: active ? color : Colors.surfaceBackground, borderColor: color }
                                ]}>
                                    <Text style={[styles.threatLevelText, active && { color: '#FFF', fontWeight: 'bold' }]}>
                                        {level.toUpperCase()}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Core Metrics Grid */}
                <View style={styles.metricsGrid}>
                    {renderMetricCard('CPU Load', `${serverLoad}%`, 'running optimal', 'server', Colors.primary)}
                    {renderMetricCard('Latency', '24ms', 'global avg', 'flash', Colors.success)}
                    {renderMetricCard('Sessions', activeSessions.toString(), 'active users', 'people', Colors.textSecondary)}
                    {renderMetricCard('Errors', '0.02%', 'last 24h', 'bug', Colors.warning)}
                </View>

                {/* Security Alerts */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Security Alerts</Text>
                    <View style={styles.liveDot}><View style={styles.liveDotInner} /></View>
                </View>

                {SECURITY_ALERTS.map((alert) => (
                    <View key={alert.id} style={styles.alertCard}>
                        <View style={styles.alertIcon}>
                            <Ionicons name="alert-circle" size={24} color={Colors.error} />
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={styles.alertTitle}>{alert.title}</Text>
                            <Text style={styles.alertLoc}>Source: {alert.location}</Text>
                        </View>
                        <View style={styles.alertActions}>
                            <TouchableOpacity
                                style={styles.investigateBtn}
                                onPress={() => handleInvestigateAlert(alert)}
                            >
                                <Text style={styles.investigateText}>INVESTIGATE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.resolveBtn}
                                onPress={() => handleResolveAlert(alert)}
                            >
                                <Text style={styles.resolveText}>RESOLVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {/* Recent Bookings (Real Data) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent System Bookings</Text>
                </View>
                <View style={[styles.logContainer, { backgroundColor: Colors.cardBackground, borderWidth: 1, borderColor: Colors.border }]}>
                    {recentBookings.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: Colors.textSecondary }}>No recent bookings found.</Text>
                        </View>
                    ) : (
                        recentBookings.map((booking) => (
                            <View key={booking.id} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                padding: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: Colors.border
                            }}>
                                <View>
                                    <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>{booking.serviceType}</Text>
                                    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                                        {booking.serviceProviderName} • {booking.clientName || 'Unknown User'}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontWeight: '600', color: Colors.primary }}>${booking.price}</Text>
                                    <Text style={{
                                        fontSize: 10,
                                        color: booking.status === 'confirmed' ? Colors.success :
                                            booking.status === 'pending' ? 'orange' : Colors.textMuted,
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold'
                                    }}>
                                        {booking.status}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Live Traffic Log (Visualized Terminal) */}
                <View style={styles.logContainer}>
                    <View style={styles.logHeader}>
                        <Ionicons name="terminal" size={16} color={Colors.textSecondary} />
                        <Text style={styles.logTitle}>Live Traffic Stream</Text>
                    </View>
                    <View style={styles.terminalWindow}>
                        <FlatList
                            data={liveTraffic}
                            renderItem={renderLogItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                        <Text style={styles.cursor}>_</Text>
                    </View>
                </View>

                {/* Geo-Security Map Placeholder (Stylized) */}
                <View style={styles.mapCard}>
                    <Text style={styles.mapTitle}>Geo-Distribution & Firewalls</Text>
                    <View style={styles.mapVisual}>
                        {/* Abstract Map Nodes */}
                        <View style={[styles.node, { top: '30%', left: '20%' }]} />
                        <View style={[styles.node, { top: '40%', left: '60%', backgroundColor: Colors.error }]} />
                        <View style={[styles.node, { top: '60%', left: '40%' }]} />
                        {/* Connecting Lines (Simulated with borders/positioning) */}
                        <View style={styles.gridLineHorizontal} />
                        <View style={styles.gridLineVertical} />
                    </View>
                    <View style={styles.mapFooter}>
                        <Text style={styles.mapStat}>North America: Secure</Text>
                        <Text style={styles.mapStat}>Europe: <Text style={{ color: Colors.error }}>Alert</Text></Text>
                        <Text style={styles.mapStat}>Asia: Secure</Text>
                    </View>
                </View>

                {/* System Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Actions</Text>
                    <View style={styles.systemActions}>
                        <TouchableOpacity
                            style={styles.systemActionButton}
                            onPress={() => Alert.alert('Backup', 'Starting system backup...')}
                        >
                            <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
                            <Text style={styles.systemActionText}>Backup</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.systemActionButton}
                            onPress={() => Alert.alert('Maintenance', 'Scheduling maintenance window...')}
                        >
                            <Ionicons name="build-outline" size={24} color={Colors.warning} />
                            <Text style={styles.systemActionText}>Maintenance</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.systemActionButton}
                            onPress={() => Alert.alert('Reports', 'Generating system reports...')}
                        >
                            <Ionicons name="document-text-outline" size={24} color={Colors.success} />
                            <Text style={styles.systemActionText}>Reports</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.systemActionButton}
                            onPress={() => Alert.alert('Shutdown', 'Initiating secure shutdown...', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Confirm', style: 'destructive', onPress: () => Alert.alert('Shutdown', 'System shutdown initiated') }
                            ])}
                        >
                            <Ionicons name="power-outline" size={24} color={Colors.error} />
                            <Text style={styles.systemActionText}>Shutdown</Text>
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
    commandBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    commandTitle: {
        fontSize: 20,
        fontWeight: '800', // Extra bold
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    commandSub: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Courier', // Monospaced feel if system supports, otherwise fallback
        fontWeight: '600',
    },
    refreshBtn: {
        padding: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
    },
    scrollContent: {
        padding: 16,
    },
    // Threat Section
    threatSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    threatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    threatTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    threatMeter: {
        flexDirection: 'row',
        gap: 8,
    },
    threatLevel: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 6,
    },
    threatLevelText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#64748B',
    },
    // Metrics Grid
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    metricCard: {
        width: (width - 44) / 2, // 2 column
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderBottomWidth: 2,
        paddingBottom: 6,
        marginBottom: 8,
    },
    metricTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    metricValue: {
        fontSize: 24,
        fontWeight: '800', // Heavy font for data
        color: '#0F172A',
        letterSpacing: -1,
    },
    metricSub: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 2,
    },
    // Section Headers
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    liveDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(239, 68, 68, 0.2)', // Light red pulse
        justifyContent: 'center',
        alignItems: 'center',
    },
    liveDotInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
    },
    // Alerts
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2', // Very light red
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    alertIcon: {
        marginRight: 12,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 4,
    },
    alertLoc: {
        fontSize: 12,
        color: '#64748B',
    },
    alertActions: {
        flexDirection: 'row',
        gap: 8,
    },
    investigateBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.primary,
        borderRadius: 6,
    },
    investigateText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },
    resolveBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.error,
        borderRadius: 6,
    },
    resolveText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },
    // Terminal Logs
    logContainer: {
        backgroundColor: '#1E293B', // Dark terminal background
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    logTitle: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '600',
    },
    terminalWindow: {
        padding: 12,
    },
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    logTime: {
        color: '#64748B',
        fontSize: 10,
        fontFamily: 'Courier',
        width: 50,
    },
    logIP: {
        color: '#38BDF8', // Light Blue
        fontSize: 11,
        fontFamily: 'Courier',
        width: 90,
    },
    logAction: {
        color: '#E2E8F0',
        fontSize: 11,
        fontFamily: 'Courier',
        flex: 1,
    },
    riskBadge: {
        paddingHorizontal: 4,
        borderRadius: 2,
    },
    riskCrit: { backgroundColor: '#EF4444' },
    riskHigh: { backgroundColor: '#F97316' },
    riskLow: { backgroundColor: '#22C55E' },
    riskText: {
        color: '#000', // High contrast on bright badges
        fontSize: 9,
        fontWeight: '700',
    },
    cursor: {
        color: '#22C55E',
        fontWeight: 'bold',
    },
    // Map Card
    mapCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 200,
    },
    mapTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
    },
    mapVisual: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        position: 'relative',
        marginBottom: 12,
        overflow: 'hidden',
    },
    node: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
        zIndex: 2,
    },
    gridLineHorizontal: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    gridLineVertical: {
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: '#E2E8F0',
    },
    mapFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mapStat: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    section: {
        marginTop: 24,
    },
    systemActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
    },
    systemActionButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        width: (width - 64) / 2,
        marginBottom: 8,
    },
    systemActionText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#0F172A',
    },
});
