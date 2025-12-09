import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface EditProfileScreenProps {
    user: UserProfile;
    onSave: (updatedUser: UserProfile) => void;
    onCancel: () => void;
}

export default function EditProfileScreen({ user, onSave, onCancel }: EditProfileScreenProps) {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
    });
    const [avatar, setAvatar] = useState(user.avatar);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Phone number is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to change your profile picture');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            try {
                setLoading(true);
                const uploadedUrl = await api.uploadProfilePicture(result.assets[0].uri);
                setAvatar(uploadedUrl);
                Alert.alert('Success', 'Profile picture updated successfully');
            } catch (error) {
                Alert.alert('Error', 'Failed to upload image. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const updatedUser = await api.updateUserProfile({
                ...user,
                ...formData,
                avatar: avatar
            });
            onSave(updatedUser);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onCancel} disabled={loading}>
                        <Ionicons name="close" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
                            {loading ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={handlePickImage}
                                disabled={loading}
                            >
                                <Ionicons name="camera" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, name: text });
                                    if (errors.name) {
                                        setErrors({ ...errors, name: '' });
                                    }
                                }}
                                editable={!loading}
                                autoCapitalize="words"
                            />
                            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                placeholder="Enter your email"
                                value={formData.email}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, email: text });
                                    if (errors.email) {
                                        setErrors({ ...errors, email: '' });
                                    }
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={[styles.input, errors.phone && styles.inputError]}
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, phone: text });
                                    if (errors.phone) {
                                        setErrors({ ...errors, phone: '' });
                                    }
                                }}
                                keyboardType="phone-pad"
                                editable={!loading}
                            />
                            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} />
                        <Text style={styles.infoText}>
                            Your profile information is visible to service providers when you book services.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    safeArea: {
        flex: 1,
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
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: Colors.primary,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.cardBackground,
    },
    formSection: {
        marginBottom: 24,
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
    infoSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.surfaceBackground,
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
});
