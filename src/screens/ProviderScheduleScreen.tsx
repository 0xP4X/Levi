import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateObject } from 'react-native-calendars';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { Booking } from '../types';

type ScheduleTab = 'pending' | 'upcoming';
type ViewMode = 'list' | 'calendar';

const EmptyState = ({ message }: { message: string }) => (
    <View style={styles.emptyState}>
        <Ionicons name="briefcase-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>{message}</Text>
    </View>
);

export default function ProviderScheduleScreen({ route, navigation }: any) {
    const { initialTab } = route.params || {};
    const [activeTab, setActiveTab] = useState<ScheduleTab>(initialTab || 'pending');
    const [viewMode, setViewMode] = useState<ViewMode>('list'); // New state for view mode
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const loadScheduleData = useCallback(async () => {
        if (!isRefreshing) setIsLoading(true);
        try {
            const allBookings = await api.getUserBookings('all');
            // Assuming '1' is the provider's ID for now, replace with actual provider ID
            const myBookings = allBookings.filter(b => b.serviceProviderId === '1');
            setBookings(myBookings);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load schedule.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    useFocusEffect(
        useCallback(() => {
            loadScheduleData();
        }, [loadScheduleData])
    );

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const onRefresh = () => {
        setIsRefreshing(true);
        loadScheduleData();
    };

    const markedDates = useMemo(() => {
        const marks: { [key: string]: any } = {};
        bookings.forEach(booking => {
            const date = booking.date; // Assuming booking.date is in 'YYYY-MM-DD' format
            if (!marks[date]) {
                marks[date] = { marked: true, dotColor: Colors.primary };
            }
        });
        if (selectedDate) {
            marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: Colors.primary };
        }
        return marks;
    }, [bookings, selectedDate]);

    const filteredBookings = useMemo(() => {
        let filtered = bookings;

        if (viewMode === 'calendar' && selectedDate) {
            filtered = filtered.filter(b => b.date === selectedDate);
        } else {
            // Apply tab filtering only in list view or if no date is selected in calendar view
            filtered = filtered.filter(b => {
                if (activeTab === 'pending') return b.status === 'pending';
                if (activeTab === 'upcoming') return b.status === 'confirmed';
                return false;
            });
        }
        return filtered;
    }, [bookings, activeTab, viewMode, selectedDate]);

    const renderJobCard = (booking: Booking) => (
        <TouchableOpacity
            key={booking.id}
            style={styles.jobCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('JobDetail', { bookingId: booking.id })}
        >
            <View style={styles.jobContent}>
                <View style={styles.jobHeader}>
                    <Text style={styles.taskTitle}>{booking.serviceType}</Text>
                    <View style={[styles.statusBadge, booking.status === 'confirmed' ? styles.badgeUpcoming : styles.badgePending]}>
                        <Text style={[styles.statusText, booking.status === 'confirmed' ? styles.textUpcoming : styles.textPending]}>
                            {booking.status}
                        </Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.clientName}>{booking.clientName}</Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>{booking.date} at {booking.time}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Custom Tab Bar for Pending/Upcoming */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'pending' && styles.tabItemActive]}
                    onPress={() => {
                        setActiveTab('pending');
                        setViewMode('list'); // Switch to list view when changing tabs
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'upcoming' && styles.tabItemActive]}
                    onPress={() => {
                        setActiveTab('upcoming');
                        setViewMode('list'); // Switch to list view when changing tabs
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
                </TouchableOpacity>
            </View>

            {/* View Mode Toggle */}
            <View style={styles.viewModeToggle}>
                <TouchableOpacity
                    style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
                    onPress={() => setViewMode('list')}
                >
                    <Ionicons name="list" size={20} color={viewMode === 'list' ? Colors.primary : Colors.textSecondary} />
                    <Text style={[styles.viewModeText, viewMode === 'list' && styles.viewModeTextActive]}>List</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.viewModeButton, viewMode === 'calendar' && styles.viewModeButtonActive]}
                    onPress={() => setViewMode('calendar')}
                >
                    <Ionicons name="calendar" size={20} color={viewMode === 'calendar' ? Colors.primary : Colors.textSecondary} />
                    <Text style={[styles.viewModeText, viewMode === 'calendar' && styles.viewModeTextActive]}>Calendar</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                >
                    {viewMode === 'calendar' ? (
                        <>
                            <Calendar
                                onDayPress={(day: DateObject) => setSelectedDate(day.dateString)}
                                markedDates={markedDates}
                                theme={{
                                    calendarBackground: Colors.background,
                                    textSectionTitleColor: Colors.textPrimary,
                                    selectedDayBackgroundColor: Colors.primary,
                                    selectedDayTextColor: Colors.white,
                                    todayTextColor: Colors.primary,
                                    dayTextColor: Colors.textPrimary,
                                    textDisabledColor: Colors.textMuted,
                                    dotColor: Colors.primary,
                                    selectedDotColor: Colors.white,
                                    arrowColor: Colors.primary,
                                    monthTextColor: Colors.textPrimary,
                                    textMonthFontWeight: 'bold',
                                    textDayHeaderFontWeight: '500',
                                }}
                            />
                            <View style={styles.calendarJobsList}>
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map(renderJobCard)
                                ) : (
                                    <EmptyState message={`No jobs on ${selectedDate}.`} />
                                )}
                            </View>
                        </>
                    ) : (
                        filteredBookings.length > 0 ? (
                            <View style={styles.jobsList}>
                                {filteredBookings.map(renderJobCard)}
                            </View>
                        ) : (
                            <EmptyState message={activeTab === 'pending' ? "No pending jobs right now." : "Your schedule is clear."} />
                        )
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: Colors.cardBackground,
        paddingHorizontal: 16,
        paddingTop: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabItemActive: {
        borderBottomColor: Colors.primary,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    tabTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    viewModeToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: Colors.cardBackground,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    viewModeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    viewModeButtonActive: {
        backgroundColor: Colors.primary + '15',
    },
    viewModeText: {
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    viewModeTextActive: {
        color: Colors.primary,
    },
    content: {
        padding: 16,
        flexGrow: 1,
    },
    jobsList: {
        gap: 12,
    },
    calendarJobsList: {
        marginTop: 16,
        gap: 12,
    },
    jobCard: {
        flexDirection: 'row',
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    jobContent: {
        flex: 1,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        textTransform: 'capitalize',
    },
    badgeUpcoming: { backgroundColor: Colors.success + '15' },
    badgePending: { backgroundColor: Colors.warning + '15' },
    statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    textUpcoming: { color: Colors.success },
    textPending: { color: Colors.warning },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    clientName: { fontSize: 14, color: Colors.textSecondary },
    detailText: { fontSize: 13, color: Colors.textSecondary },
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
});
