import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { UserProfile } from '../types';

export default function ProviderProfileScreen({ navigation }: any) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Editable fields state
    const [name, setName] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [aboutText, setAboutText] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null); // State for avatar URI

    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const userProfile = await api.getUserProfile();
            setProfile(userProfile);
            setName(userProfile.name || '');
            setServiceName(userProfile.serviceProviderProfile?.serviceTitle || '');
            setAboutText(userProfile.serviceProviderProfile?.about || '');
            setAvatarUri(userProfile.avatar || null); // Set initial avatar URI
        } catch (error) {
            console.error("Failed to load profile", error);
            Alert.alert("Error", "Failed to load profile data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [loadProfile])
    );

    const pickImage = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setAvatarUri(result.assets[0].uri);
            // In a real app, you would upload this image to a server and get a URL
            // For now, we'll just update the local state and assume the API call handles it.
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (!profile) return;

            const updatedProfile: UserProfile = {
                ...profile,
                name: name,
                avatar: avatarUri || profile.avatar, // Update avatar URI
                serviceProviderProfile: profile.serviceProviderProfile ? {
                    ...profile.serviceProviderProfile,
                    serviceTitle: serviceName,
                    about: aboutText,
                } : { // Create if it doesn't exist
                    id: profile.id, // Assuming provider ID is same as user ID
                    serviceTitle: serviceName,
                    about: aboutText,
                    isAvailable: true, // Default
                    rating: 0, // Default
                }
            };
            await api.updateUserProfile(updatedProfile);
            setProfile(updatedProfile); // Update local state
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error("Failed to save profile", error);
            Alert.alert("Error", "Failed to save profile changes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    if (!profile) {
        return <View style={styles.centered}><Text>Profile not found.</Text></View>;
    }

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatarUri || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                    {isEditing && (
                        <TouchableOpacity style={styles.camIcon} onPress={pickImage}>
                            <Ionicons name="camera" size={16} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>
                {isEditing ? (
                    <TextInput
                        style={styles.nameInput}
                        value={name}
                        onChangeText={setName}
                    />
                ) : (
                    <Text style={styles.profileName}>{profile.name}</Text>
                )}
                <TouchableOpacity onPress={() => navigation.navigate('Reviews')}>
                    <Text style={styles.ratingText}>⭐ {profile.serviceProviderProfile?.rating?.toFixed(1) || 'N/A'} Rating</Text>
                </TouchableOpacity>
            </View>

            {/* Service Info */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Service Details</Text>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Service Title</Text>
                        <TextInput
                            style={styles.input}
                            value={serviceName}
                            onChangeText={setServiceName}
                            editable={isEditing}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>About Me</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={aboutText}
                            onChangeText={setAboutText}
                            multiline
                            editable={isEditing}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                {isEditing ? (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.surfaceBackground,
    },
    camIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    nameInput: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        textAlign: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    input: {
        backgroundColor: Colors.surfaceBackground,
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 12,
    },
    buttonContainer: {
        marginTop: 10,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    editButton: {
        backgroundColor: Colors.surfaceBackground,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    editButtonText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 16,
    },
});
