import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
} from 'react-native';
import { Colors, FontSizes } from '../constants/Colors';

interface SplashScreenProps {
    onFinish?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Fade in animation
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

        // Navigate after animation
        const timer = setTimeout(() => {
            onFinish?.();
        }, 2500);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, onFinish]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Logo V - Simplified SVG-like representation */}
                <View style={styles.logoWrapper}>
                    <Text style={styles.logoText}>V</Text>
                </View>

                <Text style={styles.appName}>VIA AI</Text>
                <Text style={styles.tagline}>Powered by Gemini</Text>
            </Animated.View>

            {/* Loading indicator */}
            <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
                <View style={styles.loadingDot} />
                <View style={[styles.loadingDot, styles.loadingDotMiddle]} />
                <View style={styles.loadingDot} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoWrapper: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 80,
        fontWeight: '900',
        color: Colors.textPrimary,
        fontStyle: 'italic',
    },
    appName: {
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: 16,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 80,
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginHorizontal: 4,
    },
    loadingDotMiddle: {
        opacity: 0.6,
    },
});

export default SplashScreen;
