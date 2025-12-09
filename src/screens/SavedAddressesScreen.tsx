import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface Address {
    id: string;
    label: string; // e.g., "Home", "Work", "Client A"
    street: string;
    city: string;
    state: string;
    zip: string;
    isDefault: boolean;
}

export default function SavedAddressesScreen() {
    const [addresses, setAddresses] = useState<Address[]>([
        { id: '1', label: 'Home', street: '123 Main St', city: 'Anytown', state: 'CA', zip: '90210', isDefault: true },
        { id: '2', label: 'Office', street: '456 Oak Ave', city: 'Anytown', state: 'CA', zip: '90210', isDefault: false },
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressLabel, setAddressLabel] = useState('');
    const [addressStreet, setAddressStreet] = useState('');
    const [addressCity, setAddressCity] = useState('');
    const [addressState, setAddressState] = useState('');
    const [addressZip, setAddressZip] = useState('');

    const openAddressModal = (address: Address | null = null) => {
        setEditingAddress(address);
        setAddressLabel(address ? address.label : '');
        setAddressStreet(address ? address.street : '');
        setAddressCity(address ? address.city : '');
        setAddressState(address ? address.state : '');
        setAddressZip(address ? address.zip : '');
        setModalVisible(true);
    };

    const handleSaveAddress = () => {
        if (!addressLabel || !addressStreet || !addressCity || !addressState || !addressZip) {
            Alert.alert('Error', 'Please fill all fields.');
            return;
        }

        const newOrUpdatedAddress: Address = {
            id: editingAddress ? editingAddress.id : String(addresses.length + 1),
            label: addressLabel,
            street: addressStreet,
            city: addressCity,
            state: addressState,
            zip: addressZip,
            isDefault: editingAddress ? editingAddress.isDefault : false,
        };

        if (editingAddress) {
            setAddresses(addresses.map(addr => addr.id === newOrUpdatedAddress.id ? newOrUpdatedAddress : addr));
            Alert.alert('Success', 'Address updated successfully!');
        } else {
            setAddresses([...addresses, newOrUpdatedAddress]);
            Alert.alert('Success', 'Address added successfully!');
        }

        setModalVisible(false);
    };

    const handleSetDefault = (id: string) => {
        setAddresses(addresses.map(addr =>
            addr.id === id
                ? { ...addr, isDefault: true }
                : { ...addr, isDefault: false }
        ));
        Alert.alert('Success', 'Default address updated.');
    };

    const handleDeleteAddress = (id: string) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => setAddresses(addresses.filter(addr => addr.id !== id)),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {addresses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={40} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>No saved addresses yet.</Text>
                    </View>
                ) : (
                    addresses.map(address => (
                        <View key={address.id} style={styles.addressCard}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="home-outline" size={24} color={Colors.textPrimary} />
                                <Text style={styles.addressLabel}>{address.label}</Text>
                                {address.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultBadgeText}>Default</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.addressText}>{address.street}</Text>
                            <Text style={styles.addressText}>{address.city}, {address.state} {address.zip}</Text>
                            <View style={styles.cardActions}>
                                {!address.isDefault && (
                                    <TouchableOpacity style={styles.actionButton} onPress={() => handleSetDefault(address.id)}>
                                        <Text style={styles.actionButtonText}>Set as Default</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity style={styles.actionButton} onPress={() => openAddressModal(address)}>
                                    <Text style={styles.actionButtonText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteAddress(address.id)}>
                                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => openAddressModal()}>
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
                        <Text style={styles.modalTitle}>{editingAddress ? 'Edit Address' : 'Add New Address'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Label (e.g., Home, Work)"
                            value={addressLabel}
                            onChangeText={setAddressLabel}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Street Address"
                            value={addressStreet}
                            onChangeText={setAddressStreet}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="City"
                            value={addressCity}
                            onChangeText={setAddressCity}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="State"
                            value={addressState}
                            onChangeText={setAddressState}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Zip Code"
                            value={addressZip}
                            onChangeText={setAddressZip}
                            keyboardType="numeric"
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color={Colors.textMuted} />
                            <Button title="Save" onPress={handleSaveAddress} color={Colors.primary} />
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
    addressCard: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    addressLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    defaultBadge: {
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 10,
    },
    defaultBadgeText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    addressText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 5,
    },
    cardActions: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'flex-end',
        gap: 10,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: Colors.surfaceBackground,
    },
    actionButtonText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 13,
    },
    deleteButton: {
        backgroundColor: Colors.error + '15',
    },
    deleteButtonText: {
        color: Colors.error,
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