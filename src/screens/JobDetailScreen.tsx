
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { Booking } from '../types';

export default function JobDetailScreen({ route, navigation }: any) {
    const { bookingId } = route.params;
    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadBookingDetails();
    }, [bookingId]);

    const loadBookingDetails = async () => {
        setIsLoading(true);
        try {
            // In a real app, you'd fetch one booking: const data = await api.getBookingById(bookingId);
            // For now, we find it from the mock list.
            const allBookings = await api.getUserBookings('all');
            const foundBooking = allBookings.find(b => b.id === bookingId);
            setBooking(foundBooking || null);
        } catch (error) {
            Alert.alert("Error", "Failed to load booking details.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (status: 'confirmed' | 'declined' | 'completed') => {
        if (!booking) return;
        try {
            await api.updateBookingStatus(booking.id, status);
            Alert.alert("Success", `Job has been ${status}.`);
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Failed to update job status.");
        }
    };

    const handleGetDirections = () => {
        if (!booking?.location) return;
        const { latitude, longitude } = booking.location;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url);
    };

    const renderActionButtons = () => {
        if (!booking) return null;

        switch (booking.status) {
            case 'pending':
                return (
                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={[styles.button, styles.declineButton]} onPress={() => handleUpdateStatus('declined')}>
                            <Text style={[styles.buttonText, styles.declineButtonText]}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={() => handleUpdateStatus('confirmed')}>
                            <Text style={[styles.buttonText, styles.acceptButtonText]}>Accept Job</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'confirmed':
                return (
                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={[styles.button, styles.directionsButton]} onPress={handleGetDirections}>
                            <Ionicons name="navigate-circle-outline" size={20} color={Colors.primary} />
                            <Text style={[styles.buttonText, styles.directionsButtonText]}>Get Directions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={() => handleUpdateStatus('completed')}>
                            <Text style={[styles.buttonText, styles.completeButtonText]}>Mark as Complete</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null; // No actions for 'completed' or 'declined' on this screen
        }
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    if (!booking) {
        return <View style={styles.centered}><Text>Job not found.</Text></View>;
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {booking.location && (
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            ...booking.location,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        <Marker coordinate={booking.location} pinColor={Colors.primary} />
                    </MapView>
                )}

                <View style={styles.card}>
                    <Text style={styles.serviceTitle}>{booking.serviceType}</Text>
                    <View style={styles.timeRow}>
                        <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.timeText}>{booking.date}</Text>
                        <Ionicons name="time-outline" size={16} color={Colors.textSecondary} style={{ marginLeft: 12 }} />
                        <Text style={styles.timeText}>{booking.time}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Client Details</Text>
                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>{booking.clientName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>{booking.address}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={18} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>(123) 456-7890</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Job Notes</Text>
                    <Text style={styles.notesText}>
                        {booking.notes || "No additional notes from the client."}
                    </Text>
                </View>

            </ScrollView>
            <View style={styles.footer}>
                {renderActionButtons()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    content: { padding: 16, paddingBottom: 24 },
    map: {
        height: 200,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    serviceTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    detailText: {
        fontSize: 15,
        color: Colors.textPrimary,
    },
    notesText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    footer: {
        padding: 16,
        paddingBottom: 30,
        backgroundColor: Colors.cardBackground,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    declineButton: {
        backgroundColor: Colors.surfaceBackground,
    },
    declineButtonText: {
        color: Colors.textPrimary,
    },
    acceptButton: {
        backgroundColor: Colors.success,
    },
    acceptButtonText: {
        color: '#FFF',
    },
    directionsButton: {
        backgroundColor: Colors.surfaceBackground,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    directionsButtonText: {
        color: Colors.primary,
    },
    completeButton: {
        backgroundColor: Colors.primary,
    },
    completeButtonText: {
        color: '#FFF',
    },
});
