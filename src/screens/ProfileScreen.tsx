import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
    Modal,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { UserProfile } from '../types';
import PaymentMethodsScreen from './PaymentMethodsScreen';
import SavedAddressesScreen from './SavedAddressesScreen';
import NotificationSettingsScreen from './NotificationSettingsScreen';
import PrivacySecurityScreen from './PrivacySecurityScreen';
import EditProfileScreen from './EditProfileScreen';

interface ProfileScreenProps {
    onLogout: () => void;
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [locationEnabled, setLocationEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [showPaymentMethods, setShowPaymentMethods] = useState(false);
    const [showAddresses, setShowAddresses] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserProfile();
        setRefreshing(false);
    };

    const fetchUserProfile = async () => {
        try {
            const userData = await api.getUserProfile();
            setUser(userData);
            setLoading(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to load profile data');
            setLoading(false);
        }
    };

    const menuItems = [
        { icon: 'card-outline', label: 'Payment Methods', badge: null, action: () => setShowPaymentMethods(true) },
        { icon: 'location-outline', label: 'Saved Addresses', badge: null, action: () => setShowAddresses(true) },
        { icon: 'notifications-outline', label: 'Notifications', badge: '2', action: () => setShowNotifications(true) },
        { icon: 'shield-checkmark-outline', label: 'Privacy & Security', badge: null, action: () => setShowPrivacy(true) },
        { icon: 'help-circle-outline', label: 'Help & Support', badge: null, action: () => Alert.alert('Help', 'Contact support at support@leviapp.com') },
        { icon: 'moon-outline', label: 'Dark Mode', badge: null, action: () => { }, isToggle: true, toggleValue: darkMode, onToggle: () => setDarkMode(!darkMode) },
    ];

    const handleBecomeProvider = () => {
        Alert.alert(
            'Become a Service Provider',
            'Join our network of professionals and start earning money by offering your services.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Apply Now',
                    onPress: () => Alert.alert(
                        'Application Submitted',
                        'Thank you for your interest! Our team will review your application and contact you within 2 business days.',
                        [{ text: 'OK' }]
                    )
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
                    <Text style={styles.errorText}>Failed to load profile</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchUserProfile}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => setShowEditProfile(true)}>
                    <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
            >

                {/* Profile Header */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        <TouchableOpacity style={styles.cameraBtn} onPress={() => setShowEditProfile(true)}>
                            <Ionicons name="camera" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.membershipBadge}>
                        <Ionicons name="star" size={14} color="#FFF" />
                        <Text style={styles.membershipText}>Gold Member</Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Bookings</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>4.8</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>2</Text>
                        <Text style={styles.statLabel}>Favorites</Text>
                    </View>
                </View>

                {/* Become a Provider Banner */}
                <TouchableOpacity style={styles.providerBanner} activeOpacity={0.8} onPress={handleBecomeProvider}>
                    <View style={styles.bannerContent}>
                        <Ionicons name="briefcase-outline" size={24} color="#FFF" />
                        <View style={styles.bannerText}>
                            <Text style={styles.bannerTitle}>Become a Service Provider</Text>
                            <Text style={styles.bannerDesc}>Earn money by offering your skills</Text>
                        </View>
                    </View>
                    <Ionicons name="arrow-forward" size={24} color="#FFF" />
                </TouchableOpacity>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <View style={styles.menuCard}>
                        {menuItems.map((item, index) => (
                            <React.Fragment key={index}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={item.action}
                                    disabled={item.isToggle}
                                >
                                    <View style={styles.menuLeft}>
                                        <View style={styles.menuIconBox}>
                                            <Ionicons name={item.icon as any} size={20} color={Colors.textPrimary} />
                                        </View>
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                    </View>
                                    <View style={styles.menuRight}>
                                        {item.badge && (
                                            <View style={styles.menuBadge}>
                                                <Text style={styles.menuBadgeText}>{item.badge}</Text>
                                            </View>
                                        )}
                                        {item.isToggle ? (
                                            <Switch
                                                value={item.toggleValue}
                                                onValueChange={item.onToggle}
                                                trackColor={{ false: Colors.border, true: Colors.primary }}
                                                thumbColor={item.toggleValue ? '#FFF' : '#FFF'}
                                            />
                                        ) : (
                                            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                                {index < menuItems.length - 1 && <View style={styles.divider} />}
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        activeOpacity={0.7}
                        onPress={onLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Version Info */}
                <View style={styles.versionInfo}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>

            {/* Modals for Settings Screens */}
            <Modal
                visible={showPaymentMethods}
                animationType="slide"
                onRequestClose={() => setShowPaymentMethods(false)}
            >
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowPaymentMethods(false)}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Payment Methods</Text>
                    <View style={{ width: 24 }} /> {/* Spacer for alignment */}
                </View>
                <PaymentMethodsScreen showHeader={false} />
            </Modal>

            <Modal
                visible={showAddresses}
                animationType="slide"
                onRequestClose={() => setShowAddresses(false)}
            >
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowAddresses(false)}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Saved Addresses</Text>
                    <View style={{ width: 24 }} /> {/* Spacer for alignment */}
                </View>
                <SavedAddressesScreen showHeader={false} />
            </Modal>

            <Modal
                visible={showNotifications}
                animationType="slide"
                onRequestClose={() => setShowNotifications(false)}
            >
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowNotifications(false)}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Notifications</Text>
                    <View style={{ width: 24 }} /> {/* Spacer for alignment */}
                </View>
                <NotificationSettingsScreen showHeader={false} />
            </Modal>

            <Modal
                visible={showPrivacy}
                animationType="slide"
                onRequestClose={() => setShowPrivacy(false)}
            >
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowPrivacy(false)}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Privacy & Security</Text>
                    <View style={{ width: 24 }} /> {/* Spacer for alignment */}
                </View>
                <PrivacySecurityScreen showHeader={false} />
            </Modal>

            {user && (
                <Modal
                    visible={showEditProfile}
                    animationType="slide"
                    onRequestClose={() => setShowEditProfile(false)}
                >
                    <EditProfileScreen
                        user={user}
                        onSave={(updatedUser) => {
                            setUser(updatedUser);
                            setShowEditProfile(false);
                        }}
                        onCancel={() => setShowEditProfile(false)}
                    />
                </Modal>
            )}
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.cardBackground,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    editBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: Colors.primary,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.cardBackground,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 15,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    membershipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warning,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    membershipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: Colors.border,
        marginHorizontal: 16,
    },
    providerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    bannerText: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    bannerDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
    },
    menuSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuCard: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.surfaceBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuBadge: {
        backgroundColor: Colors.error,
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    menuBadgeText: {
        fontSize: 11,
        color: '#FFF',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.surfaceBackground,
        marginLeft: 60,
    },
    actionSection: {
        marginBottom: 24,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.error + '10',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.error + '30',
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.error,
    },
    versionInfo: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    versionText: {
        fontSize: 12,
        color: Colors.textMuted,
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.error,
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: Colors.primary,
        borderRadius: 8,
    },
    retryText: {
        color: '#FFF',
        fontWeight: '600',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.cardBackground,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
});
