import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    ScrollView,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Booking } from '../types';
import { api } from '../services/api';

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed';

export default function BookingsScreen() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await api.getUserBookings(filter);
            setBookings(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleCancelBooking = (bookingId: string) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.cancelBooking(bookingId);
                            fetchBookings();
                            Alert.alert('Success', 'Booking cancelled successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel booking');
                        }
                    },
                },
            ]
        );
    };

    const handleViewDetails = (booking: Booking) => {
        Alert.alert(
            'Booking Details',
            `Service: ${booking.serviceType}\n` +
            `Provider: ${booking.serviceProviderName}\n` +
            `Date: ${booking.date}\n` +
            `Time: ${booking.time}\n` +
            `Price: $${booking.price}\n` +
            `Status: ${booking.status}`,
            [{ text: 'OK' }]
        );
    };

    const handleReschedule = (booking: Booking) => {
        setSelectedBooking(booking);
        setNewDate(booking.date);
        setNewTime(booking.time);
        setShowRescheduleModal(true);
    };

    const handleConfirmReschedule = async () => {
        if (!selectedBooking || !newDate || !newTime) {
            Alert.alert('Error', 'Please select a new date and time');
            return;
        }

        try {
            await api.rescheduleBooking(selectedBooking.id, newDate, newTime);
            setShowRescheduleModal(false);
            setSelectedBooking(null);
            fetchBookings();
            Alert.alert('Success', 'Booking rescheduled successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to reschedule booking');
        }
    };

    const filteredBookings = bookings.filter(booking =>
        booking.serviceProviderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderBooking = ({ item }: { item: Booking }) => {
        const statusColors = {
            pending: { bg: Colors.warning + '15', text: Colors.warning },
            confirmed: { bg: Colors.success + '15', text: Colors.success },
            completed: { bg: Colors.textMuted + '15', text: Colors.textMuted },
            cancelled: { bg: Colors.error + '15', text: Colors.error },
            rejected: { bg: Colors.error + '15', text: Colors.error },
        };

        const statusColor = statusColors[item.status];

        return (
            <View style={styles.bookingCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.providerInfo}>
                        {item.avatar && (
                            <Image source={{ uri: item.avatar }} style={styles.providerAvatar} />
                        )}
                        <View>
                            <Text style={styles.providerName}>{item.serviceProviderName}</Text>
                            <Text style={styles.serviceType}>{item.serviceType}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                        <Text style={[styles.statusText, { color: statusColor.text }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{item.date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{item.time}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.priceText}>${item.price}</Text>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => handleViewDetails(item)}
                    >
                        <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>

                    {item.status === 'pending' && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleCancelBooking(item.id)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}

                    {item.status === 'confirmed' && (
                        <TouchableOpacity
                            style={styles.rescheduleButton}
                            onPress={() => handleReschedule(item)}
                        >
                            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Centered Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Bookings</Text>
            </View>

            {/* Search Bar */}
            {bookings.length > 10 && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color={Colors.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search bookings..."
                            placeholderTextColor={Colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContentContainer}
                >
                    {(['all', 'pending', 'confirmed', 'completed'] as FilterType[]).map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterTab, filter === f && styles.filterTabActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text
                                style={[styles.filterText, filter === f && styles.filterTextActive]}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>No bookings found</Text>
                            <Text style={styles.emptySubText}>Your bookings will appear here</Text>
                        </View>
                    }
                />
            )}

            {/* Reschedule Modal */}
            <Modal
                visible={showRescheduleModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowRescheduleModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Reschedule Booking</Text>
                            <TouchableOpacity onPress={() => setShowRescheduleModal(false)}>
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {selectedBooking && (
                                <View style={styles.bookingInfo}>
                                    <Text style={styles.bookingInfoLabel}>Current Booking:</Text>
                                    <Text style={styles.bookingInfoText}>
                                        {selectedBooking.serviceProviderName} - {selectedBooking.serviceType}
                                    </Text>
                                    <Text style={styles.bookingInfoText}>
                                        {selectedBooking.date} at {selectedBooking.time}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Date *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="MM/DD/YYYY"
                                    value={newDate}
                                    onChangeText={setNewDate}
                                />
                                <Text style={styles.hint}>Format: MM/DD/YYYY (e.g., 12/25/2024)</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Time *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="HH:MM AM/PM"
                                    value={newTime}
                                    onChangeText={setNewTime}
                                />
                                <Text style={styles.hint}>Format: HH:MM AM/PM (e.g., 10:00 AM)</Text>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowRescheduleModal(false)}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirmReschedule}
                            >
                                <Text style={styles.confirmButtonText}>Confirm Reschedule</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingTop: 0,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: Colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    filterContainer: {
        backgroundColor: Colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    filterContentContainer: {
        gap: 12,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.surfaceBackground,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filterTabActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceBackground,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.textPrimary,
        padding: 0,
    },
    list: {
        padding: 16,
    },
    bookingCard: {
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
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    providerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    providerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surfaceBackground,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    serviceType: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    cardBody: {
        gap: 8,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.error + '15',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.error + '30',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.error,
    },
    viewButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    rescheduleButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: Colors.surfaceBackground,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    rescheduleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.cardBackground,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    modalBody: {
        padding: 20,
    },
    bookingInfo: {
        backgroundColor: Colors.surfaceBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    bookingInfoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    bookingInfoText: {
        fontSize: 15,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.surfaceBackground,
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    hint: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 4,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    modalCancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: Colors.surfaceBackground,
        alignItems: 'center',
    },
    modalCancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    confirmButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});


