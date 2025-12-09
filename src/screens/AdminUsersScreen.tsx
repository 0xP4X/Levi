import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';


// Initial Mock Users
const INITIAL_USERS = [
    { id: '1', name: 'Alice Freeman', role: 'Provider', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=1', email: 'alice@example.com' },
    { id: '2', name: 'Bob Smith', role: 'User', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=2', email: 'bob@example.com' },
    { id: '3', name: 'Charlie Brown', role: 'Provider', status: 'Pending', avatar: 'https://i.pravatar.cc/150?u=3', email: 'charlie@newprovider.com' },
    { id: '4', name: 'Diana Prince', role: 'User', status: 'Suspended', avatar: 'https://i.pravatar.cc/150?u=4', email: 'diana@baduser.com' },
    { id: '5', name: 'Evan Wright', role: 'Provider', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=5', email: 'evan@pro.com' },
];

export default function AdminUsersScreen() {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const handleStatusChange = (userId: string, newStatus: string) => {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    };

    const handleApprove = (user: typeof INITIAL_USERS[0]) => {
        Alert.alert(
            "Approve Provider",
            `Are you sure you want to approve ${user.name} as a service provider?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Approve", onPress: () => handleStatusChange(user.id, 'Active') }
            ]
        );
    };

    const handleReject = (user: typeof INITIAL_USERS[0]) => {
        Alert.alert(
            "Reject Application",
            `Reject application for ${user.name}? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Reject", style: 'destructive', onPress: () => handleStatusChange(user.id, 'Rejected') }
            ]
        );
    };

    const handleSuspend = (user: typeof INITIAL_USERS[0]) => {
        const isSuspended = user.status === 'Suspended';
        const action = isSuspended ? "Reactivate" : "Suspend";

        Alert.alert(
            `${action} User`,
            `Are you sure you want to ${action.toLowerCase()} ${user.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: action,
                    style: isSuspended ? 'default' : 'destructive',
                    onPress: () => handleStatusChange(user.id, isSuspended ? 'Active' : 'Suspended')
                }
            ]
        );
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' ||
            (filter === 'Pending' && user.status === 'Pending') ||
            (filter === 'User' && user.role === 'User') ||
            (filter === 'Provider' && user.role === 'Provider');
        return matchesSearch && matchesFilter;
    });

    const renderUserItem = ({ item }: { item: typeof INITIAL_USERS[0] }) => (
        <View style={styles.userCard}>
            <View style={styles.cardHeader}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.tagsRow}>
                        <View style={[styles.roleBadge, item.role === 'Provider' ? styles.roleProvider : styles.roleUser]}>
                            <Text style={[styles.roleText, item.role === 'Provider' ? styles.textProvider : styles.textUser]}>
                                {item.role}
                            </Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            item.status === 'Active' ? styles.statusActive :
                                item.status === 'Pending' ? styles.statusPending : styles.statusSuspended
                        ]}>
                            <Text style={[
                                styles.statusText,
                                item.status === 'Active' ? styles.textActive :
                                    item.status === 'Pending' ? styles.textPending : styles.textSuspended
                            ]}>
                                {item.status}
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.moreBtn}
                    onPress={() => handleSuspend(item)}
                >
                    <Ionicons name="power" size={18} color={item.status === 'Suspended' ? Colors.success : Colors.error} />
                </TouchableOpacity>
            </View>

            {/* Admin Actions Bar for Pending Providers */}
            {item.status === 'Pending' && item.role === 'Provider' && (
                <View style={styles.adminActions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleReject(item)}
                    >
                        <Ionicons name="close-circle" size={16} color={Colors.error} />
                        <Text style={styles.rejectText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleApprove(item)}
                    >
                        <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                        <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>User & Access Control</Text>
                <TouchableOpacity style={styles.addBtn}>
                    <Ionicons name="person-add" size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Search & Filter */}
            <View style={styles.controlBar}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users by name or email..."
                        placeholderTextColor={Colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <View style={styles.filterRow}>
                    {['All', 'Pending', 'Provider', 'User'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, filter === f && styles.filterChipActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
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
    addBtn: {
        padding: 8,
        backgroundColor: Colors.surfaceBackground,
        borderRadius: 8,
    },
    controlBar: {
        padding: 16,
        backgroundColor: Colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceBackground,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: Colors.textPrimary,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: Colors.surfaceBackground,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    userCard: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.surfaceBackground,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 6,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    roleProvider: {
        backgroundColor: Colors.primary + '15',
    },
    roleUser: {
        backgroundColor: Colors.textSecondary + '15',
    },
    roleText: {
        fontSize: 10,
        fontWeight: '600',
    },
    textProvider: { color: Colors.primary },
    textUser: { color: Colors.textSecondary },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusActive: { backgroundColor: Colors.success + '15' },
    statusPending: { backgroundColor: Colors.warning + '15' },
    statusSuspended: { backgroundColor: Colors.error + '15' },
    statusText: { fontSize: 10, fontWeight: '600' },
    textActive: { color: Colors.success },
    textPending: { color: Colors.warning },
    textSuspended: { color: Colors.error },
    moreBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: Colors.surfaceBackground,
    },
    adminActions: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: Colors.surfaceBackground,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    approveBtn: {
        backgroundColor: Colors.success,
    },
    rejectBtn: {
        backgroundColor: Colors.cardBackground,
        borderWidth: 1,
        borderColor: Colors.error,
    },
    approveText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
    },
    rejectText: {
        color: Colors.error,
        fontSize: 13,
        fontWeight: '700',
    },
});
