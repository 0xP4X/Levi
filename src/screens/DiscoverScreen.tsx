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
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { ServiceProvider } from '../types';

export default function DiscoverScreen() {
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const data = await api.getProviders(searchQuery, sortBy);
            setProviders(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load service providers');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, [searchQuery, sortBy]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProviders();
    };

    const handleToggleFavorite = async (providerId: string) => {
        try {
            await api.toggleFavorite(providerId);
            // In a real app, we would update the UI to reflect the favorite status
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
                    style={styles.favoriteButton}
                    onPress={() => handleToggleFavorite(item.id)}
                >
                    <Ionicons name="heart-outline" size={20} color={Colors.error} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookNow(item)}
                >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Discover Services</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search services or providers..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <TouchableOpacity 
                    style={[styles.filterButton, sortBy === 'distance' && styles.activeFilter]}
                    onPress={() => setSortBy('distance')}
                >
                    <Text style={[styles.filterText, sortBy === 'distance' && styles.activeFilterText]}>Distance</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.filterButton, sortBy === 'rating' && styles.activeFilter]}
                    onPress={() => setSortBy('rating')}
                >
                    <Text style={[styles.filterText, sortBy === 'rating' && styles.activeFilterText]}>Rating</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.filterButton, sortBy === 'price' && styles.activeFilter]}
                    onPress={() => setSortBy('price')}
                >
                    <Text style={[styles.filterText, sortBy === 'price' && styles.activeFilterText]}>Price</Text>
                </TouchableOpacity>
            </View>

            {/* Results */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading services...</Text>
                </View>
            ) : (
                <FlatList
                    data={providers}
                    renderItem={renderProvider}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={64} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>No services found</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                        </View>
                    }
                />
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardBackground,
        margin: 20,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.surfaceBackground,
        marginRight: 10,
    },
    activeFilter: {
        backgroundColor: Colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    activeFilterText: {
        color: '#FFF',
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
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginRight: 8,
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
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    metaText: {
        fontSize: 12,
        color: Colors.textMuted,
        marginLeft: 4,
    },
    priceText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    favoriteButton: {
        padding: 8,
    },
    bookButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    bookButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
});
