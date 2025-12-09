import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    isPrimary: boolean;
}

export default function PayoutsScreen({ navigation }: any) {
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
        { id: '1', bankName: 'Bank of America', accountNumber: '**** **** **** 1234', routingNumber: '012345678', isPrimary: true },
        { id: '2', bankName: 'Wells Fargo', accountNumber: '**** **** **** 5678', routingNumber: '876543210', isPrimary: false },
    ]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBankName, setNewBankName] = useState('');
    const [newAccountNumber, setNewAccountNumber] = useState('');
    const [newRoutingNumber, setNewRoutingNumber] = useState('');

    const handleAddAccount = () => {
        if (!newBankName || !newAccountNumber || !newRoutingNumber) {
            Alert.alert('Error', 'Please fill all fields.');
            return;
        }

        const newAccount: BankAccount = {
            id: String(bankAccounts.length + 1),
            bankName: newBankName,
            accountNumber: `**** **** **** ${newAccountNumber.slice(-4)}`, // Mask account number
            routingNumber: newRoutingNumber,
            isPrimary: false,
        };

        setBankAccounts([...bankAccounts, newAccount]);
        setShowAddForm(false);
        setNewBankName('');
        setNewAccountNumber('');
        setNewRoutingNumber('');
        Alert.alert('Success', 'Bank account added successfully!');
    };

    const handleSetPrimary = (id: string) => {
        setBankAccounts(bankAccounts.map(account =>
            account.id === id
                ? { ...account, isPrimary: true }
                : { ...account, isPrimary: false }
        ));
        Alert.alert('Success', 'Primary account updated.');
    };

    const handleRemoveAccount = (id: string) => {
        Alert.alert(
            'Remove Account',
            'Are you sure you want to remove this bank account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => setBankAccounts(bankAccounts.filter(account => account.id !== id)),
                },
            ]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Your Payout Methods</Text>

            {bankAccounts.length === 0 && !showAddForm ? (
                <View style={styles.emptyState}>
                    <Ionicons name="card-outline" size={40} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>No payout methods added yet.</Text>
                </View>
            ) : (
                bankAccounts.map(account => (
                    <View key={account.id} style={styles.bankAccountCard}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="business-outline" size={24} color={Colors.textPrimary} />
                            <Text style={styles.bankName}>{account.bankName}</Text>
                            {account.isPrimary && (
                                <View style={styles.primaryBadge}>
                                    <Text style={styles.primaryBadgeText}>Primary</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.accountDetail}>Account: {account.accountNumber}</Text>
                        <Text style={styles.accountDetail}>Routing: {account.routingNumber}</Text>
                        <View style={styles.cardActions}>
                            {!account.isPrimary && (
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleSetPrimary(account.id)}>
                                    <Text style={styles.actionButtonText}>Set as Primary</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.actionButton, styles.removeButton]} onPress={() => handleRemoveAccount(account.id)}>
                                <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}

            {showAddForm ? (
                <View style={styles.addForm}>
                    <Text style={styles.formTitle}>Add New Bank Account</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Bank Name"
                        value={newBankName}
                        onChangeText={setNewBankName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Account Number"
                        keyboardType="numeric"
                        value={newAccountNumber}
                        onChangeText={setNewAccountNumber}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Routing Number"
                        keyboardType="numeric"
                        value={newRoutingNumber}
                        onChangeText={setNewRoutingNumber}
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={handleAddAccount}>
                        <Text style={styles.saveButtonText}>Save Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddForm(false)}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm(true)}>
                    <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
                    <Text style={styles.addButtonText}>Add New Payout Method</Text>
                </TouchableOpacity>
            )}

            <View style={styles.infoSection}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} />
                <Text style={styles.infoText}>
                    All transactions are securely processed. Your financial information is encrypted.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: Colors.background,
        padding: 16,
        paddingBottom: 100, // Adjust for tab bar
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 20,
    },
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        gap: 10,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    bankAccountCard: {
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
    bankName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    primaryBadge: {
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 10,
    },
    primaryBadgeText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    accountDetail: {
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
    removeButton: {
        backgroundColor: Colors.error + '15',
    },
    removeButtonText: {
        color: Colors.error,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 20,
    },
    addButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    addForm: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        fontSize: 15,
        color: Colors.textPrimary,
        backgroundColor: Colors.background,
    },
    saveButton: {
        backgroundColor: Colors.success,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    infoSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.info + '10',
        borderRadius: 12,
        padding: 15,
        marginTop: 30,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
});