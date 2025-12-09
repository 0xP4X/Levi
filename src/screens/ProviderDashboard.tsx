import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { Booking, UserProfile } from '../types';

export default function ProviderDashboard() {
    const navigation = useNavigation<any>();

    const formatCurrency = (amount: number) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: 'USD',
            }).format(amount);
        } catch {
            return `$${amount.toFixed(2)}`;
        }
    };
    const [isAvailable, setIsAvailable] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState({
        todayEarnings: 0,
        weekEarnings: 0,
        monthEarnings: 0,
        rating: 0,
        completedJobs: 0,
        pendingBookings: 0,
        activeJobs: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

    const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
    const [pendingCount, setPendingCount] = useState(0);

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const profile = await api.getUserProfile();
            setUserProfile(profile);

            // Update header with user's name
            navigation.setOptions({
                headerTitle: `Hello, ${profile.firstName || 'Partner'}`,
                userName: profile.firstName || 'Partner', // Pass name for custom header
            });

            const allBookings = await api.getUserBookings('all');
            const myBookings = allBookings.filter(b => b.serviceProviderId === profile.id);

            const completed = myBookings.filter(b => b.status === 'completed');
            const confirmed = myBookings.filter(b => b.status === 'confirmed');
            const pending = myBookings.filter(b => b.status === 'pending');

            const earnedTotal = completed.reduce((sum, b) => sum + b.price, 0);

            setStats({
                todayEarnings: earnedTotal * 0.15,
                weekEarnings: earnedTotal * 0.4,
                monthEarnings: earnedTotal,
                rating: profile.serviceProviderProfile?.rating || 0,
                completedJobs: completed.length,
                pendingBookings: pending.length,
                activeJobs: confirmed.length,
            });

            setActiveBookings(confirmed);
            setPendingCount(pending.length);

            if (profile.serviceProviderProfile) {
                setIsAvailable(profile.serviceProviderProfile.isAvailable);
            }
        } catch (error) {
            console.error("Failed to load dashboard data", error);
            Alert.alert("Error", "Failed to load dashboard data.");
        } finally {
            setIsLoading(false);
        }
    }, [navigation]); // Add navigation to useCallback dependencies

    useFocusEffect(
        useCallback(() => {
            loadDashboardData();
            const interval = setInterval(loadDashboardData, 60000);
            return () => clearInterval(interval);
        }, [loadDashboardData])
    );

    const handleCompleteJob = (bookingId: string) => {
        Alert.alert(
            "Complete Job",
            "Mark this job as completed?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Complete",
                    onPress: async () => {
                        try {
                            await api.updateBookingStatus(bookingId, 'completed');
                            loadDashboardData();
                        } catch (error) {
                            Alert.alert("Error", "Failed to update status");
                        }
                    }
                }
            ]
        );
    };

    const handleAvailabilityToggle = async (value: boolean) => {
        setIsUpdatingAvailability(true);
        try {
            if (!userProfile || !userProfile.serviceProviderProfile) {
                Alert.alert("Error", "Provider profile not found.");
                setIsUpdatingAvailability(false);
                return;
            }
            const updatedProfile = {
                ...userProfile,
                serviceProviderProfile: {
                    ...userProfile.serviceProviderProfile,
                    isAvailable: value,
                },
            };
            await api.updateUserProfile(updatedProfile);
            setIsAvailable(value);
            Alert.alert("Success", `You are now ${value ? 'online' : 'offline'}.`);
        } catch (error) {
            console.error("Failed to update availability", error);
            Alert.alert("Error", "Failed to update availability.");
        } finally {
            setIsUpdatingAvailability(false);
        }
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Earnings Card (Hero) */}
            <TouchableOpacity style={styles.heroCard} onPress={() => navigation.navigate('ProviderEarnings')}>
                <LinearGradient
                    colors={[Colors.primary, '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCardGradient}
                >
                    <View>
                        <Text style={styles.heroLabel}>Earned this Month</Text>
                        <Text style={styles.heroAmount}>{formatCurrency(stats.monthEarnings)}</Text>
                    </View>
                    <View style={styles.heroStats}>
                        <View>
                            <Text style={styles.heroStatLabel}>This Week</Text>
                            <Text style={styles.heroStatValue}>{formatCurrency(stats.weekEarnings)}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View>
                            <Text style={styles.heroStatLabel}>Today</Text>
                            <Text style={styles.heroStatValue}>{formatCurrency(stats.todayEarnings)}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Pending Requests Alert */}
            {pendingCount > 0 && (
                <TouchableOpacity style={styles.alertBanner} onPress={() => navigation.navigate('ProviderSchedule', { initialTab: 'pending' })}>
                    <View style={styles.alertContent}>
                        <View style={styles.alertIcon}>
                            <Ionicons name="notifications" size={20} color="#FFF" />
                        </View>
                        <View>
                            <Text style={styles.alertTitle}>{pendingCount} New Request{pendingCount > 1 ? 's' : ''}</Text>
                            <Text style={styles.alertSubtitle}>Review and accept new bookings</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
            )}

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Reviews')}>
                    <Ionicons name="star" size={22} color="#FBBF24" />
                    <Text style={styles.statValue}>{stats.rating.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('ProviderEarnings')}>
                    <Ionicons name="briefcase" size={22} color={Colors.success} />
                    <Text style={styles.statValue}>{stats.completedJobs}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('ProviderSchedule', { initialTab: 'upcoming' })}>
                    <Ionicons name="time" size={22} color={Colors.primary} />
                    <Text style={styles.statValue}>{stats.activeJobs}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </TouchableOpacity>
            </View>

            {/* Availability Switch */}
            <View style={styles.sectionContainer}>
                <View style={styles.availabilityRow}>
                    <View style={styles.availabilityInfo}>
                        <Text style={styles.sectionTitle}>Availability</Text>
                        <Text style={styles.sectionSubtitle}>
                            {isAvailable ? "You are online and visible" : "You are offline"}
                        </Text>
                    </View>
                    {isUpdatingAvailability ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                        <Switch
                            value={isAvailable}
                            onValueChange={handleAvailabilityToggle}
                            trackColor={{ false: '#E2E8F0', true: Colors.available }}
                            thumbColor={'#FFF'}
                            ios_backgroundColor="#E2E8F0"
                        />
                    )}
                </View>
            </View>

            {/* Current Job (If Active) */}
            {activeBookings.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Current Active Job</Text>
                    {activeBookings.slice(0, 1).map(booking => (
                        <TouchableOpacity key={booking.id} style={styles.activeJobCard} onPress={() => navigation.navigate('JobDetail', { bookingId: booking.id })}>
                            <View style={styles.activeJobHeader}>
                                <Text style={styles.activeJobService}>{booking.serviceType}</Text>
                                <View style={styles.liveBadge}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveText}>LIVE</Text>
                                </View>
                            </View>
                            <View style={styles.clientRow}>
                                <View style={styles.clientAvatar}>
                                    <Text style={styles.clientInitial}>
                                        {booking.clientName ? booking.clientName[0] : 'C'}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.clientName}>{booking.clientName || 'Client'}</Text>
                                    <Text style={styles.jobTime}>{booking.time} • {booking.date}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.completeBtn}
                                onPress={() => handleCompleteJob(booking.id)}
                            >
                                <Text style={styles.completeBtnText}>Mark as Complete</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    scrollContent: {
        padding: 20,
        paddingBottom: 120, // Adjusted for floating tab bar
    },
    heroCard: {
        borderRadius: 24,
        marginBottom: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    heroCardGradient: {
        borderRadius: 24,
        padding: 24,
    },
    heroLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    heroAmount: {
        color: '#FFF',
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
    },
    heroStats: {
        flexDirection: 'row',
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 20,
    },
    heroStatLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginBottom: 4,
    },
    heroStatValue: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    alertContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    alertIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    alertSubtitle: {
        fontSize: 12,
        color: '#64748B',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        gap: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    sectionContainer: {
        marginBottom: 24,
    },
    activeJobCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: Colors.success,
    },
    activeJobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    activeJobService: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
    },
    liveText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#059669',
    },
    clientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    clientAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clientInitial: {
        fontSize: 18,
        fontWeight: '700',
        color: '#64748B',
    },
    clientName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    jobTime: {
        fontSize: 13,
        color: '#64748B',
    },
    completeBtn: {
        backgroundColor: Colors.primary,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    completeBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    availabilityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
    },
    availabilityInfo: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#64748B',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 12,
    },
});
