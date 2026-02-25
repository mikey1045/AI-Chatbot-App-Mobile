import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
    Image,
} from 'react-native';
import { FontSizes } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
    onFinish?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const { theme, isDarkMode } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const dot1Anim = useRef(new Animated.Value(0.3)).current;
    const dot2Anim = useRef(new Animated.Value(0.3)).current;
    const dot3Anim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Logo fade-in + scale animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Sequential pulsing dots animation
        const animateDots = () => {
            const createPulse = (dotAnim: Animated.Value, delay: number) =>
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dotAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotAnim, {
                        toValue: 0.3,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]);

            Animated.loop(
                Animated.parallel([
                    createPulse(dot1Anim, 0),
                    createPulse(dot2Anim, 200),
                    createPulse(dot3Anim, 400),
                ])
            ).start();
        };

        animateDots();

        const timer = setTimeout(() => {
            onFinish?.();
        }, 2500);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, dot1Anim, dot2Anim, dot3Anim, onFinish]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />

                <Text style={[styles.appName, { color: theme.textPrimary }]}>VIA AI</Text>
                <Text style={[styles.tagline, { color: theme.textSecondary }]}>Powered by Gemini</Text>
            </Animated.View>

            <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
                <Animated.View style={[styles.loadingDot, { backgroundColor: theme.primary, opacity: dot1Anim }]} />
                <Animated.View style={[styles.loadingDot, { backgroundColor: theme.primary, opacity: dot2Anim }]} />
                <Animated.View style={[styles.loadingDot, { backgroundColor: theme.primary, opacity: dot3Anim }]} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoImage: {
        width: 100,
        height: 100,
    },
    appName: {
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        marginTop: 20,
        letterSpacing: 4,
    },
    tagline: {
        fontSize: FontSizes.sm,
        marginTop: 8,
        letterSpacing: 1,
    },
    loadingContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 80,
    },
    loadingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 6,
    },
});

export default SplashScreen;

