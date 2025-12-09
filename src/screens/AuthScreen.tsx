import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

type UserRole = 'user' | 'provider' | 'admin';

interface AuthScreenProps {
    onLogin: (role: UserRole) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
    
    const [isLogin, setIsLogin] = useState(true);
    const [selectedRole, setSelectedRole] = useState<UserRole>('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAuth = () => {
        // Basic validation
        if (!email || !password) {
            Alert.alert('Validation Error', 'Please enter both email and password');
            return;
        }
        
        if (!isLogin && !name) {
            Alert.alert('Validation Error', 'Please enter your full name');
            return;
        }
        
        // Mock authentication - in real app, this would call an API
        setLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onLogin(selectedRole);
        }, 1000);
    };

    const handleSocialLogin = (provider: string) => {
        Alert.alert(
            'Social Login', 
            `Logging in with ${provider}. This feature is coming soon!`,
            [{ text: 'OK' }]
        );
    };

    const handleForgotPassword = () => {
        Alert.alert(
            'Forgot Password',
            'Enter your email to reset your password',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    onPress: () => Alert.alert(
                        'Password Reset', 
                        'A password reset link has been sent to your email address',
                        [{ text: 'OK' }]
                    )
                }
            ],
            { cancelable: true }
        );
    };

    const roles = [
        {
            key: 'user' as UserRole,
            label: 'User',
            icon: 'person',
            description: 'Book services'
        },
        {
            key: 'provider' as UserRole,
            label: 'Provider',
            icon: 'briefcase',
            description: 'Offer services'
        },
        {
            key: 'admin' as UserRole,
            label: 'Admin',
            icon: 'shield-checkmark',
            description: 'Manage platform'
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Removed StatusBar component since we're using the hook */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>Lume</Text>
                    <Text style={styles.tagline}>Find & Book Home Services</Text>
                </View>

                {/* Role Selection */}
                <View style={styles.roleSection}>
                    <Text style={styles.roleTitle}>I am a</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.roleGrid}
                    >
                        {roles.map((role) => (
                            <TouchableOpacity
                                key={role.key}
                                style={[
                                    styles.roleCard,
                                    selectedRole === role.key && styles.roleCardActive,
                                ]}
                                onPress={() => setSelectedRole(role.key)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={role.icon as any}
                                    size={28}
                                    color={selectedRole === role.key ? Colors.primary : Colors.textMuted}
                                />
                                <Text style={[
                                    styles.roleLabel,
                                    selectedRole === role.key && styles.roleLabelActive,
                                ]}>
                                    {role.label}
                                </Text>
                                <Text style={styles.roleDesc}>{role.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {!isLogin && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your name"
                                    placeholderTextColor={Colors.textMuted}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor={Colors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor={Colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={18}
                                    color={Colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isLogin && (
                        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.authButton, loading && styles.authButtonDisabled]}
                        onPress={handleAuth}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.authButtonText}>Processing...</Text>
                        ) : (
                            <Text style={styles.authButtonText}>
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Social Login Options */}
                    <View style={styles.socialLogin}>
                        <Text style={styles.socialLoginText}>Or continue with</Text>
                        <View style={styles.socialButtons}>
                            <TouchableOpacity 
                                style={styles.socialButton}
                                onPress={() => handleSocialLogin('Google')}
                            >
                                <Ionicons name="logo-google" size={20} color="#DB4437" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.socialButton}
                                onPress={() => handleSocialLogin('Facebook')}
                            >
                                <Ionicons name="logo-facebook" size={20} color="#4267B2" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.socialButton}
                                onPress={() => handleSocialLogin('Apple')}
                            >
                                <Ionicons name="logo-apple" size={20} color="#000000" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.switchAuth}>
                        <Text style={styles.switchAuthText}>
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                        </Text>
                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                            <Text style={styles.switchAuthLink}>
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Login Hint */}
                <View style={styles.hint}>
                    <Text style={styles.hintText}>💡 Tap any role and Sign In to continue</Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 30,
    },
    logo: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: 8,
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    roleSection: {
        marginBottom: 30,
    },
    roleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    roleGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    roleCard: {
        flex: 1,
        backgroundColor: Colors.cardBackground,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
    },
    roleCardActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '08',
    },
    roleLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.textMuted,
        marginTop: 8,
        marginBottom: 4,
    },
    roleLabelActive: {
        color: Colors.primary,
    },
    roleDesc: {
        fontSize: 10,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardBackground,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Colors.textPrimary,
        padding: 0,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: '600',
    },
    authButton: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    authButtonDisabled: {
        opacity: 0.7,
    },
    authButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.cardBackground,
    },
    socialLogin: {
        marginVertical: 20,
        alignItems: 'center',
    },
    socialLoginText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    socialButtons: {
        flexDirection: 'row',
        gap: 20,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    switchAuth: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 20,
    },
    switchAuthText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    switchAuthLink: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },
    hint: {
        alignItems: 'center',
        padding: 20,
        marginTop: 'auto',
    },
    hintText: {
        fontSize: 13,
        color: Colors.textMuted,
        textAlign: 'center',
    },
});


