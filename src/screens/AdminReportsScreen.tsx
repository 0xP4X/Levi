import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';


// Mock Reports
const REPORTS_DATA = [
    { id: '1', type: 'Payment', subject: 'Refund Request #9921', user: 'Alice Freeman', date: '2h ago', severity: 'medium', status: 'open' },
    { id: '2', type: 'Technical', subject: 'App crashes on profile', user: 'Bob Smith', date: '5h ago', severity: 'high', status: 'open' },
    { id: '3', type: 'Behavior', subject: 'Provider no-show', user: 'Diana Prince', date: '1d ago', severity: 'low', status: 'resolved' },
];

export default function AdminReportsScreen() {
    
    const [activeTab, setActiveTab] = useState('Open');

    const filteredReports = REPORTS_DATA.filter(r =>
        activeTab === 'Open' ? r.status === 'open' : r.status === 'resolved'
    );

    const renderReportItem = ({ item }: { item: typeof REPORTS_DATA[0] }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
                <View style={styles.typeTag}>
                    <Text style={styles.typeText}>{item.type}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
            </View>

            <Text style={styles.subjectText}>{item.subject}</Text>

            <View style={styles.cardFooter}>
                <View style={styles.userRow}>
                    <Ionicons name="person-circle-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.userName}>{item.user}</Text>
                </View>
                <View style={[
                    styles.severityBadge,
                    item.severity === 'high' ? styles.sevHigh :
                        item.severity === 'medium' ? styles.sevMed : styles.sevLow
                ]}>
                    <Text style={[
                        styles.sevText,
                        item.severity === 'high' ? styles.textHigh :
                            item.severity === 'medium' ? styles.textMed : styles.textLow
                    ]}>
                        {item.severity.toUpperCase()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>System Reports</Text>
                <TouchableOpacity style={styles.exportBtn}>
                    <Ionicons name="download-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                {['Open', 'Resolved'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredReports}
                renderItem={renderReportItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-circle-outline" size={48} color={Colors.success} />
                        <Text style={styles.emptyTitle}>All Clear!</Text>
                        <Text style={styles.emptyText}>No {activeTab.toLowerCase()} reports found.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    exportBtn: {
        padding: 12,
    },
    tabs: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.cardBackground,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tabActive: {
        backgroundColor: Colors.textPrimary,
        borderColor: Colors.textPrimary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    tabTextActive: {
        color: '#FFF',
    },
    listContent: {
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    typeTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: Colors.surfaceBackground,
        borderRadius: 4,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
    },
    dateText: {
        fontSize: 12,
        color: Colors.textMuted,
    },
    subjectText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceBackground,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    userName: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    sevHigh: { backgroundColor: Colors.error + '15' },
    sevMed: { backgroundColor: Colors.warning + '15' },
    sevLow: { backgroundColor: Colors.success + '15' },
    sevText: { fontSize: 10, fontWeight: '700' },
    textHigh: { color: Colors.error },
    textMed: { color: Colors.warning },
    textLow: { color: Colors.success },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
});
