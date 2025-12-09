
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    TextInput,
    Modal,
    Button,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { Service } from '../types'; // Assuming a Service type exists

const EmptyState = ({ message }: { message: string }) => (
    <View style={styles.emptyState}>
        <Ionicons name="briefcase-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>{message}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => { /* Open add service modal */ }}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.addButtonText}>Add Your First Service</Text>
        </TouchableOpacity>
    </View>
);

export default function ServiceManagementScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceName, setServiceName] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [serviceDuration, setServiceDuration] = useState('');

    const loadServices = useCallback(async () => {
        if (!isRefreshing) setIsLoading(true);
        try {
            // Assuming an API call like api.getProviderServices(providerId)
            // For now, using mock data or filtering existing bookings for services
            const allBookings = await api.getUserBookings('all');
            const providerServices: Service[] = allBookings
                .filter(b => b.serviceProviderId === '1') // Filter for provider's bookings
                .map(b => ({
                    id: b.serviceId, // Assuming serviceId from booking
                    name: b.serviceType,
                    description: `Service for ${b.serviceType}`, // Placeholder
                    price: b.price,
                    duration: '1h', // Placeholder
                }))
                .filter((value, index, self) => self.findIndex(s => s.id === value.id) === index); // Deduplicate

            setServices(providerServices);

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load services.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    useFocusEffect(
        useCallback(() => {
            loadServices();
        }, [loadServices])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        loadServices();
    };

    const openServiceModal = (service: Service | null = null) => {
        setEditingService(service);
        setServiceName(service ? service.name : '');
        setServiceDescription(service ? service.description : '');
        setServicePrice(service ? String(service.price) : '');
        setServiceDuration(service ? service.duration : '');
        setModalVisible(true);
    };

    const handleSaveService = async () => {
        if (!serviceName || !servicePrice || !serviceDuration) {
            Alert.alert("Error", "Please fill all required fields.");
            return;
        }

        const serviceData = {
            id: editingService ? editingService.id : String(Math.random()), // Mock ID
            name: serviceName,
            description: serviceDescription,
            price: parseFloat(servicePrice),
            duration: serviceDuration,
        };

        try {
            if (editingService) {
                // await api.updateService(serviceData);
                Alert.alert("Success", "Service updated!");
            } else {
                // await api.addService(serviceData);
                Alert.alert("Success", "Service added!");
            }
            setModalVisible(false);
            loadServices(); // Reload services
        } catch (error) {
            Alert.alert("Error", "Failed to save service.");
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        Alert.alert(
            "Delete Service",
            "Are you sure you want to delete this service?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            // await api.deleteService(serviceId);
                            Alert.alert("Success", "Service deleted!");
                            loadServices();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete service.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                {services.length === 0 ? (
                    <EmptyState message="You haven't added any services yet." />
                ) : (
                    <View style={styles.servicesList}>
                        {services.map(service => (
                            <View key={service.id} style={styles.serviceItem}>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                    <Text style={styles.serviceDetails}>${service.price} • {service.duration}</Text>
                                </View>
                                <View style={styles.serviceActions}>
                                    <TouchableOpacity onPress={() => openServiceModal(service)}>
                                        <Ionicons name="create-outline" size={24} color={Colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteService(service.id)}>
                                        <Ionicons name="trash-outline" size={24} color={Colors.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => openServiceModal()}>
                <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add New Service'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Service Name"
                            value={serviceName}
                            onChangeText={setServiceName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Description (Optional)"
                            value={serviceDescription}
                            onChangeText={setServiceDescription}
                            multiline
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Price (e.g., 50.00)"
                            value={servicePrice}
                            onChangeText={setServicePrice}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Duration (e.g., 1h 30m)"
                            value={serviceDuration}
                            onChangeText={setServiceDuration}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color={Colors.textMuted} />
                            <Button title="Save" onPress={handleSaveService} color={Colors.primary} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    content: {
        padding: 16,
        flexGrow: 1,
        paddingBottom: 100, // Space for FAB
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceBackground,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 8,
        marginTop: 20,
    },
    addButtonText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    servicesList: {
        gap: 12,
    },
    serviceItem: {
        flexDirection: 'row',
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    serviceDetails: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    serviceActions: {
        flexDirection: 'row',
        gap: 15,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 20,
        width: '90%',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: Colors.surfaceBackground,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.textPrimary,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
});
