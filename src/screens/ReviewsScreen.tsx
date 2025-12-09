
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { Review } from '../types'; // Assuming a Review type exists

const EmptyState = ({ message }: { message: string }) => (
    <View style={styles.emptyState}>
        <Ionicons name="star-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>{message}</Text>
    </View>
);

export default function ReviewsScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);

    const loadReviews = useCallback(async () => {
        if (!isRefreshing) setIsLoading(true);
        try {
            // Assuming an API call like api.getProviderReviews(providerId)
            // For now, using mock data or filtering existing bookings for reviews
            const allBookings = await api.getUserBookings('all');
            const providerReviews: Review[] = allBookings
                .filter(b => b.serviceProviderId === '1' && b.review) // Filter for provider's completed bookings with reviews
                .map(b => ({
                    id: b.id,
                    clientName: b.clientName,
                    rating: b.review?.rating || 0,
                    comment: b.review?.comment || '',
                    date: b.date, // Using booking date for review date
                }));

            setReviews(providerReviews);

            if (providerReviews.length > 0) {
                const totalRating = providerReviews.reduce((sum, r) => sum + r.rating, 0);
                setAverageRating(totalRating / providerReviews.length);
            } else {
                setAverageRating(0);
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load reviews.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [isRefreshing]);

    useFocusEffect(
        useCallback(() => {
            loadReviews();
        }, [loadReviews])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        loadReviews();
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
            {reviews.length === 0 ? (
                <EmptyState message="No reviews yet. Complete more jobs to get feedback!" />
            ) : (
                <>
                    <View style={styles.ratingSummaryCard}>
                        <Ionicons name="star" size={30} color="#FFD700" />
                        <Text style={styles.averageRatingText}>{averageRating.toFixed(1)}</Text>
                        <Text style={styles.totalReviewsText}>({reviews.length} reviews)</Text>
                    </View>

                    <View style={styles.reviewsList}>
                        {reviews.map(review => (
                            <View key={review.id} style={styles.reviewItem}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.clientName}>{review.clientName}</Text>
                                    <View style={styles.starRating}>
                                        {[...Array(5)].map((_, i) => (
                                            <Ionicons
                                                key={i}
                                                name={i < review.rating ? "star" : "star-outline"}
                                                size={16}
                                                color={i < review.rating ? "#FFD700" : Colors.textMuted}
                                            />
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                                <Text style={styles.reviewDate}>{review.date}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    content: {
        padding: 16,
        flexGrow: 1,
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
    ratingSummaryCard: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    averageRatingText: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    totalReviewsText: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    reviewsList: {
        gap: 16,
    },
    reviewItem: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    starRating: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewComment: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    reviewDate: {
        fontSize: 12,
        color: Colors.textMuted,
        textAlign: 'right',
    },
});
