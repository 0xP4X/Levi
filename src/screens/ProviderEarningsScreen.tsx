import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { Booking } from '../types';

const { width } = Dimensions.get('window');

type EarningsPeriod = 'month' | 'lastMonth' | 'all';

const EmptyState = () => (
    <View style={styles.emptyState}>
        <Ionicons name="wallet-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>Your earnings and transactions will appear here once you complete jobs.</Text>
    </View>
);

export default function ProviderEarningsScreen({ navigation }: any) {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [allCompletedBookings, setAllCompletedBookings] = useState<Booking[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<EarningsPeriod>('month');

    const loadEarningsData = useCallback(async () => {
        if (!isRefreshing) setIsLoading(true);
        try {
            const allBookings = await api.getUserBookings('all');
            const myCompleted = allBookings.filter(b => b.serviceProviderId === '1' && b.status === 'completed');
            setAllCompletedBookings(myCompleted);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load earnings data.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    useFocusEffect(
        useCallback(() => {
            loadEarningsData();
        }, [loadEarningsData])
    );

    const onRefresh = async () => {
        setIsRefreshing(true);
        await loadEarningsData();
        setIsRefreshing(false);
    };

    const filteredCompletedBookings = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        switch (selectedPeriod) {
            case 'month':
                startDate.setDate(1); // Start of current month
                break;
            case 'lastMonth':
                startDate.setMonth(now.getMonth() - 1);
                startDate.setDate(1); // Start of last month
                break;
            case 'all':
            default:
                return allCompletedBookings; // No date filtering needed
        }

        // Ensure startDate is at the beginning of the day
        startDate.setHours(0, 0, 0, 0);

        return allCompletedBookings.filter(booking => {
            const bookingDate = new Date(booking.date); // Assuming booking.date is 'YYYY-MM-DD'
            bookingDate.setHours(0, 0, 0, 0); // Normalize to start of day
            return bookingDate >= startDate && bookingDate <= now;
        });
    }, [allCompletedBookings, selectedPeriod]);

    const totalBalance = filteredCompletedBookings.reduce((sum, b) => sum + b.price, 0);

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
            {allCompletedBookings.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {/* Total Balance Card */}
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceLabel}>Total Earned</Text>
                        <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
                        <TouchableOpacity style={styles.payoutButton} onPress={() => navigation.navigate('Payouts')}>
                            <Text style={styles.payoutButtonText}>Manage Payouts</Text>
                            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Recent Transactions */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Completed Jobs</Text>
                            <View style={styles.periodFilter}>
                                <TouchableOpacity
                                    style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
                                    onPress={() => setSelectedPeriod('month')}
                                >
                                    <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>This Month</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.periodButton, selectedPeriod === 'lastMonth' && styles.periodButtonActive]}
                                    onPress={() => setSelectedPeriod('lastMonth')}
                                >
                                    <Text style={[styles.periodButtonText, selectedPeriod === 'lastMonth' && styles.periodButtonTextActive]}>Last Month</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.periodButton, selectedPeriod === 'all' && styles.periodButtonActive]}
                                    onPress={() => setSelectedPeriod('all')}
                                >
                                    <Text style={[styles.periodButtonText, selectedPeriod === 'all' && styles.periodButtonTextActive]}>All Time</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.transactionsList}>
                            {filteredCompletedBookings.length > 0 ? (
                                filteredCompletedBookings.map((tx) => (
                                    <View key={tx.id} style={styles.transactionItem}>
                                        <View style={[styles.txIcon, { backgroundColor: Colors.success + '15' }]}>
                                            <Ionicons name={"checkmark"} size={18} color={Colors.success} />
                                        </View>
                                        <View style={styles.txContent}>
                                            <Text style={styles.txClient}>{tx.serviceType}</Text>
                                            <Text style={styles.txDate}>{tx.date}</Text>
                                        </View>
                                        <Text style={styles.txAmount}>
                                            +${tx.price.toFixed(2)}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.noTransactions}>
                                    <Text style={styles.noTransactionsText}>No completed jobs for this period.</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    content: {
        padding: 16,
        flexGrow: 1,
    },
    balanceCard: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 8,
    },
    balanceAmount: {
        color: '#FFF',
        fontSize: 36,
        fontWeight: '800',
        marginBottom: 16,
    },
    payoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    payoutButtonText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap', // Allow filter buttons to wrap
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    periodFilter: {
        flexDirection: 'row',
        backgroundColor: Colors.surfaceBackground,
        borderRadius: 10,
        padding: 4,
        gap: 4,
    },
    periodButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    periodButtonActive: {
        backgroundColor: Colors.cardBackground,
    },
    periodButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    periodButtonTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    transactionsList: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBackground,
    },
    txIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    txContent: {
        flex: 1,
    },
    txClient: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    txDate: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.success,
    },
    emptyState: {
        flex: 1,
        paddingTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textMuted,
        fontWeight: '500',
        textAlign: 'center',
    },
    noTransactions: {
        padding: 20,
        alignItems: 'center',
    },
    noTransactionsText: {
        color: Colors.textMuted,
        fontSize: 14,
    },
});
