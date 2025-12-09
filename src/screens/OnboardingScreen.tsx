import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    StatusBar,
    ImageBackground,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface Slide {
    key: number;
    title: string;
    description: string;
    icon: string;
    colors: [string, string];
}

const SLIDES: Slide[] = [
    {
        key: 1,
        title: 'Premium Service',
        description: 'Experience top-tier home services tailored to your lifestyle. Quality you can trust.',
        icon: 'diamond',
        colors: ['#4F46E5', '#818CF8'],
    },
    {
        key: 2,
        title: 'Verified Experts',
        description: 'Connect with strictly vetted professionals who are masters of their craft.',
        icon: 'shield-checkmark',
        colors: ['#059669', '#34D399'],
    },
    {
        key: 3,
        title: 'Seamless Experience',
        description: 'Book, track, and pay with ease. We handle the details so you can enjoy the results.',
        icon: 'phone-portrait',
        colors: ['#7C3AED', '#A78BFA'],
    },
];

export default function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<Animated.FlatList<Slide>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Animation/Transition Values
    const listOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(listOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
            setCurrentIndex(currentIndex + 1);
        } else {
            onFinish();
        }
    };

    const handleSkip = () => {
        onFinish();
    };

    const LoadingIndicator = ({ scrollX }: { scrollX: Animated.Value }) => {
        return (
            <View style={styles.paginationContainer}>
                {SLIDES.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [10, 30, 10],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={i.toString()}
                            style={[
                                styles.dot,
                                { width: dotWidth, opacity, backgroundColor: '#FFF' }
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    const renderItem = ({ item, index }: { item: Slide, index: number }) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
        });

        const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [50, 0, 50],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
        });

        return (
            <View style={{ width, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            transform: [{ scale }, { translateY }],
                            opacity
                        }
                    ]}
                >
                    <LinearGradient
                        colors={item.colors}
                        style={styles.circleGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name={item.icon as any} size={84} color="#FFF" />
                    </LinearGradient>
                </Animated.View>

                <Animated.View style={{ opacity, transform: [{ translateY }] }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </Animated.View>
            </View>
        );
    };

    const Backdrop = ({ scrollX }: { scrollX: Animated.Value }) => {
        const backgroundColor = scrollX.interpolate({
            inputRange: SLIDES.map((_, i) => i * width),
            outputRange: SLIDES.map((s) => s.colors[0]),
        });

        return (
            <Animated.View
                style={[
                    StyleSheet.absoluteFillObject,
                    {
                        backgroundColor,
                        zIndex: -1
                    },
                ]}
            />
        );
    }

    // We used a flatlist instead of scrollview for better index handling
    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Animated Background Color */}
            <Backdrop scrollX={scrollX} />

            {/* Glossy Overlay */}
            <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.2)']}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>

                <Animated.FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    keyExtractor={(item) => item.key.toString()}
                    renderItem={renderItem}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={32}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                    style={{ flex: 1, opacity: listOpacity }}
                />

                <View style={styles.footer}>
                    <LoadingIndicator scrollX={scrollX} />

                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.nextText}>
                            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <Ionicons name={currentIndex === SLIDES.length - 1 ? "checkmark" : "arrow-forward"} size={22} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 20,
    },
    skipBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    skipText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    iconContainer: {
        marginBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    circleGradient: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -1,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    description: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        maxWidth: 320,
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: 40,
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 30,
    },
    paginationContainer: {
        flexDirection: 'row',
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
    },
    nextButton: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
        gap: 10,
    },
    nextText: {
        color: Colors.primary,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});