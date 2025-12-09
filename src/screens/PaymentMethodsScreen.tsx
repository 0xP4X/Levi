import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';

interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'bank';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    name?: string;
}

interface PaymentMethodsScreenProps {
    showHeader?: boolean;
}

export default function PaymentMethodsScreen({ showHeader = true }: PaymentMethodsScreenProps) {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            // In a real app, this would fetch from the backend
            // For now, we'll use mock data
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
            
            const mockMethods: PaymentMethod[] = [
                {
                    id: '1',
                    type: 'card',
                    last4: '4242',
                    brand: 'Visa',
                    expiryMonth: 12,
                    expiryYear: 2025,
                    isDefault: true,
                    name: 'John Doe'
                },
                {
                    id: '2',
                    type: 'card',
                    last4: '5678',
                    brand: 'Mastercard',
                    expiryMonth: 8,
                    expiryYear: 2026,
                    isDefault: false,
                    name: 'John Doe'
                }
            ];
            
            setPaymentMethods(mockMethods);
        } catch (error) {
            Alert.alert('Error', 'Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!cardName.trim()) {
            newErrors.cardName = 'Cardholder name is required';
        }
        
        if (!cardNumber.trim()) {
            newErrors.cardNumber = 'Card number is required';
        } else if (cardNumber.replace(/\s/g, '').length < 16) {
            newErrors.cardNumber = 'Card number must be 16 digits';
        }
        
        if (!expiryMonth.trim()) {
            newErrors.expiryMonth = 'Expiry month is required';
        } else if (!/^(0?[1-9]|1[0-2])$/.test(expiryMonth)) {
            newErrors.expiryMonth = 'Invalid month';
        }
        
        if (!expiryYear.trim()) {
            newErrors.expiryYear = 'Expiry year is required';
        } else if (parseInt(expiryYear) < new Date().getFullYear()) {
            newErrors.expiryYear = 'Card expired';
        }
        
        if (!cvv.trim()) {
            newErrors.cvv = 'CVV is required';
        } else if (cvv.length < 3) {
            newErrors.cvv = 'Invalid CVV';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/);
        if (!match) return '';
        return match[1] + (match[2] ? ' ' + match[2] : '') + (match[3] ? ' ' + match[3] : '') + (match[4] ? ' ' + match[4] : '');
    };

    const handleAddCard = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);
            
            // In a real app, this would send to the backend
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            
            const last4 = cardNumber.replace(/\s/g, '').slice(-4);
            const newCard: PaymentMethod = {
                id: Date.now().toString(),
                type: 'card',
                last4,
                brand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
                expiryMonth: parseInt(expiryMonth),
                expiryYear: parseInt(expiryYear),
                isDefault: paymentMethods.length === 0,
                name: cardName
            };

            setPaymentMethods([...paymentMethods, newCard]);
            setShowAddModal(false);
            resetForm();
            Alert.alert('Success', 'Payment method added successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to add payment method. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            // In a real app, this would update the backend
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            
            setPaymentMethods(
                paymentMethods.map(pm => ({
                    ...pm,
                    isDefault: pm.id === id,
                }))
            );
            Alert.alert('Success', 'Default payment method updated');
        } catch (error) {
            Alert.alert('Error', 'Failed to update default payment method');
        }
    };

    const handleDelete = (id: string) => {
        const methodToDelete = paymentMethods.find(pm => pm.id === id);
        if (!methodToDelete) return;
        
        Alert.alert(
            'Delete Payment Method',
            `Are you sure you want to delete the ${methodToDelete.brand} ending in ${methodToDelete.last4}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // In a real app, this would delete from the backend
                            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
                            
                            setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
                            Alert.alert('Success', 'Payment method deleted');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete payment method');
                        }
                    },
                },
            ]
        );
    };

    const resetForm = () => {
        setCardNumber('');
        setCardName('');
        setExpiryMonth('');
        setExpiryYear('');
        setCvv('');
        setErrors({});
    };

    const renderPaymentMethod = (method: PaymentMethod) => (
        <View key={method.id} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                    <View style={styles.cardIcon}>
                        <Ionicons
                            name={method.type === 'card' ? 'card' : method.type === 'paypal' ? 'logo-paypal' : 'wallet'}
                            size={24}
                            color={Colors.primary}
                        />
                    </View>
                    <View style={styles.cardDetails}>
                        {method.type === 'card' ? (
                            <>
                                <View style={styles.cardTopRow}>
                                    <Text style={styles.cardBrand}>{method.brand}</Text>
                                    {method.isDefault && (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultText}>Default</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
                                <Text style={styles.cardExpiry}>
                                    Expires {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear.toString().slice(-2)}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.cardBrand}>
                                {method.type === 'paypal' ? 'PayPal' : 'Bank Account'}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
            <View style={styles.cardActions}>
                {!method.isDefault && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(method.id)}
                    >
                        <Ionicons name="checkmark-circle-outline" size={20} color={Colors.primary} />
                        <Text style={styles.actionText}>Set as Default</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(method.id)}
                >
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                {showHeader && (
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Payment Methods</Text>
                    </View>
                )}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading payment methods...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {showHeader && (
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Payment Methods</Text>
                </View>
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {paymentMethods.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="card-outline" size={64} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>No payment methods</Text>
                        <Text style={styles.emptySubtext}>Add a payment method to get started</Text>
                    </View>
                ) : (
                    paymentMethods.map(renderPaymentMethod)
                )}

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                    <Text style={styles.addButtonText}>Add Payment Method</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={false}
                onRequestClose={() => {
                    setShowAddModal(false);
                    resetForm();
                }}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity 
                            onPress={() => {
                                setShowAddModal(false);
                                resetForm();
                            }}
                            disabled={isSubmitting}
                        >
                            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Add Card</Text>
                        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Cardholder Name</Text>
                            <TextInput
                                style={[styles.input, errors.cardName && styles.inputError]}
                                placeholder="John Doe"
                                value={cardName}
                                onChangeText={(text) => {
                                    setCardName(text);
                                    if (errors.cardName) setErrors({...errors, cardName: ''});
                                }}
                                editable={!isSubmitting}
                                autoCapitalize="words"
                            />
                            {errors.cardName ? <Text style={styles.errorText}>{errors.cardName}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Card Number</Text>
                            <TextInput
                                style={[styles.input, errors.cardNumber && styles.inputError]}
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChangeText={(text) => {
                                    const formatted = formatCardNumber(text);
                                    setCardNumber(formatted);
                                    if (errors.cardNumber) setErrors({...errors, cardNumber: ''});
                                }}
                                keyboardType="numeric"
                                editable={!isSubmitting}
                                maxLength={19}
                            />
                            {errors.cardNumber ? <Text style={styles.errorText}>{errors.cardNumber}</Text> : null}
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Expiry Month</Text>
                                <TextInput
                                    style={[styles.input, errors.expiryMonth && styles.inputError]}
                                    placeholder="MM"
                                    value={expiryMonth}
                                    onChangeText={(text) => {
                                        setExpiryMonth(text);
                                        if (errors.expiryMonth) setErrors({...errors, expiryMonth: ''});
                                    }}
                                    keyboardType="numeric"
                                    editable={!isSubmitting}
                                    maxLength={2}
                                />
                                {errors.expiryMonth ? <Text style={styles.errorText}>{errors.expiryMonth}</Text> : null}
                            </View>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Expiry Year</Text>
                                <TextInput
                                    style={[styles.input, errors.expiryYear && styles.inputError]}
                                    placeholder="YYYY"
                                    value={expiryYear}
                                    onChangeText={(text) => {
                                        setExpiryYear(text);
                                        if (errors.expiryYear) setErrors({...errors, expiryYear: ''});
                                    }}
                                    keyboardType="numeric"
                                    editable={!isSubmitting}
                                    maxLength={4}
                                />
                                {errors.expiryYear ? <Text style={styles.errorText}>{errors.expiryYear}</Text> : null}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CVV</Text>
                            <TextInput
                                style={[styles.input, errors.cvv && styles.inputError]}
                                placeholder="123"
                                value={cvv}
                                onChangeText={(text) => {
                                    setCvv(text);
                                    if (errors.cvv) setErrors({...errors, cvv: ''});
                                }}
                                keyboardType="numeric"
                                editable={!isSubmitting}
                                maxLength={4}
                                secureTextEntry
                            />
                            {errors.cvv ? <Text style={styles.errorText}>{errors.cvv}</Text> : null}
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setShowAddModal(false);
                                resetForm();
                            }}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                            onPress={handleAddCard}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Add Card</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
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
        paddingHorizontal: 20,
        paddingTop: 0,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.cardBackground,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: Colors.surfaceBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardDetails: {
        flex: 1,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardBrand: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    cardNumber: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    cardExpiry: {
        fontSize: 12,
        color: Colors.textMuted,
    },
    defaultBadge: {
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    defaultText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
    },
    deleteButton: {
        marginLeft: 'auto',
    },
    actionText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
    deleteText: {
        color: Colors.error,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
        gap: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 0,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.cardBackground,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    modalContent: {
        flex: 1,
        padding: 20,
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
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputError: {
        borderColor: Colors.error,
        borderWidth: 1,
    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.cardBackground,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: Colors.surfaceBackground,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});
