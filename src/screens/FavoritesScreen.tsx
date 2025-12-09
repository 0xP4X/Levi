import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    ScrollView,
    Share,
    Linking,
    Modal,
} from 'react-native';
// Clipboard functionality - simplified
const copyToClipboard = async (text: string) => {
    try {
        // Try using Share API as fallback
        await Share.share({ message: text });
    } catch (error) {
        console.warn('Clipboard not available:', error);
    }
};
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { ServiceProvider } from '../types';

export default function FavoritesScreen() {

    const [favorites, setFavorites] = useState<ServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'rating' | 'distance'>('name');
    const [showSortModal, setShowSortModal] = useState(false);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const data = await api.getFavorites();
            setFavorites(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load favorites');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFavorites();
    };

    const handleToggleFavorite = async (providerId: string) => {
        try {
            await api.toggleFavorite(providerId);
            fetchFavorites();
            Alert.alert('Success', 'Favorite status updated');
        } catch (error) {
            Alert.alert('Error', 'Failed to update favorites');
        }
    };

    const handleBookNow = (provider: ServiceProvider) => {
        Alert.alert(
            'Book Service',
            `Book ${provider.name} for ${provider.service}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Book',
                    onPress: () => Alert.alert(
                        'Booking Request Sent',
                        `Your booking request with ${provider.name} has been sent. They will confirm shortly.`,
                        [{ text: 'OK' }]
                    )
                }
            ]
        );
    };

    const handleShareProvider = async (provider: ServiceProvider) => {
        const shareUrl = `https://leviapp.com/provider/${provider.id}`;
        const shareMessage = `Check out ${provider.name} - ${provider.service} provider on Levi App! ${shareUrl}`;

        try {
            await Share.share({
                message: shareMessage,
                title: `Share ${provider.name}`,
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share provider');
        }
    };

    const handleShareViaSMS = (provider: ServiceProvider) => {
        const shareUrl = `https://leviapp.com/provider/${provider.id}`;
        const message = `Check out ${provider.name} - ${provider.service} provider on Levi App! ${shareUrl}`;
        const smsUrl = `sms:?body=${encodeURIComponent(message)}`;

        Linking.canOpenURL(smsUrl).then(supported => {
            if (supported) {
                Linking.openURL(smsUrl);
            } else {
                Alert.alert('Error', 'SMS is not available on this device');
            }
        });
    };

    const handleShareViaEmail = (provider: ServiceProvider) => {
        const shareUrl = `https://leviapp.com/provider/${provider.id}`;
        const subject = `Check out ${provider.name} on Levi App`;
        const body = `Hi,\n\nI found this great service provider on Levi App:\n\n${provider.name}\n${provider.service}\nRating: ${provider.rating}/5\n\nView profile: ${shareUrl}`;
        const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.canOpenURL(emailUrl).then(supported => {
            if (supported) {
                Linking.openURL(emailUrl);
            } else {
                Alert.alert('Error', 'Email is not available on this device');
            }
        });
    };

    const handleCopyLink = async (provider: ServiceProvider) => {
        const shareUrl = `https://leviapp.com/provider/${provider.id}`;
        try {
            await copyToClipboard(shareUrl);
            Alert.alert('Success', 'Link shared');
        } catch (error) {
            Alert.alert('Info', `Provider link: ${shareUrl}`);
        }
    };

    const sortedFavorites = [...favorites].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'rating':
                return b.rating - a.rating;
            case 'distance':
                return a.distance - b.distance;
            default:
                return 0;
        }
    });



    const renderProvider = ({ item }: { item: ServiceProvider }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{item.name}</Text>
                        <View style={[styles.statusDot, { backgroundColor: item.isAvailable ? Colors.available : Colors.unavailable }]} />
                    </View>
                    <Text style={styles.service}>{item.service}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="star" size={14} color={Colors.warning} />
                            <Text style={styles.metaText}>{item.rating}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="location" size={14} color={Colors.textMuted} />
                            <Text style={styles.metaText}>{item.distance} km</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={styles.priceText}>${item.hourlyRate}/hr</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleToggleFavorite(item.id)}
                >
                    <Ionicons name="heart" size={20} color={Colors.error} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => handleShareProvider(item)}
                >
                    <Ionicons name="share-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bookButton}
                    disabled={!item.isAvailable}
                    onPress={() => handleBookNow(item)}
                >
                    <Text style={[styles.bookButtonText, !item.isAvailable && styles.disabledText]}>
                        {item.isAvailable ? 'Book Now' : 'Unavailable'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <Text style={styles.headerTitle}>Saved Providers</Text>
                <TouchableOpacity
                    style={styles.headerSortButton}
                    onPress={() => setShowSortModal(true)}
                >
                    <Ionicons name="filter" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={sortedFavorites}
                    renderItem={renderProvider}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="heart-outline" size={64} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>No favorites yet</Text>
                            <Text style={styles.emptySubText}>Save providers to quickly book them later</Text>
                        </View>
                    }
                />
            )}

            {/* Sort Modal */}
            <Modal
                visible={showSortModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSortModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sort By</Text>
                            <TouchableOpacity onPress={() => setShowSortModal(false)}>
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.sortOptionsList}>
                            {[
                                { key: 'name', label: 'Name', icon: 'text' },
                                { key: 'rating', label: 'Highest Rated', icon: 'star' },
                                { key: 'distance', label: 'Nearest First', icon: 'location' }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[
                                        styles.modalSortOption,
                                        sortBy === option.key && styles.modalSortOptionActive
                                    ]}
                                    onPress={() => {
                                        setSortBy(option.key as any);
                                        setShowSortModal(false);
                                    }}
                                >
                                    <View style={styles.sortOptionLeft}>
                                        <Ionicons
                                            name={option.icon as any}
                                            size={20}
                                            color={sortBy === option.key ? Colors.primary : Colors.textMuted}
                                        />
                                        <Text style={[
                                            styles.modalSortText,
                                            sortBy === option.key && styles.modalSortTextActive
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </View>
                                    {sortBy === option.key && (
                                        <Ionicons name="checkmark" size={20} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: Colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardContent: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: Colors.surfaceBackground,
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    service: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: Colors.textMuted,
    },
    priceText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    removeButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: Colors.error + '15',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.error + '30',
    },
    shareButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    bookButton: {
        flex: 1,
        height: 44,
        borderRadius: 8,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    disabledText: {
        color: Colors.textMuted,
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
        paddingTop: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 20,
    },
    emptySubText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    headerSortButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: Colors.surfaceBackground,
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
        paddingBottom: 40,
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
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    sortOptionsList: {
        padding: 20,
    },
    modalSortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalSortOptionActive: {
        backgroundColor: Colors.primary + '05',
    },
    sortOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalSortText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    modalSortTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
});


