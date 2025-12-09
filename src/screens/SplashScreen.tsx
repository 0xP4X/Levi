import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            },
        )]).start(() => {
            // Hold for a moment then fade out/finish
            setTimeout(onFinish, 1500);
        });
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.logoContainer}>
                    <Ionicons name="sparkles" size={64} color="#FFF" />
                </View>
                <Text style={styles.title}>Lume</Text>
                <Text style={styles.tagline}>Illuminating Connections</Text>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.version}>v1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary, // Brand background
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    title: {
        fontSize: 48,
        fontWeight: '800', // Scaled Heavy Heading
        color: '#FFF',
        marginBottom: 8,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
    },
    version: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
});