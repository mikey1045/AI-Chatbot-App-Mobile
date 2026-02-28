import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Image,
    StatusBar,
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

    useEffect(() => {
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

        const timer = setTimeout(() => {
            onFinish?.();
        }, 5000);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, onFinish]);

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
                <View style={styles.logoWrapper}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                <Text style={[styles.appName, { color: theme.textPrimary }]}>VIA AI</Text>
                <Text style={[styles.tagline, { color: theme.textSecondary }]}>Powered by Gemini</Text>
            </Animated.View>

            <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
                <View style={[styles.loadingDot, { backgroundColor: theme.primary }]} />
                <View style={[styles.loadingDot, styles.loadingDotMiddle, { backgroundColor: theme.primary }]} />
                <View style={[styles.loadingDot, { backgroundColor: theme.primary }]} />
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
    logoWrapper: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: 90,
        height: 90,
    },
    appName: {
        fontSize: FontSizes.xxxl,
        fontWeight: 'bold',
        marginTop: 16,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: FontSizes.sm,
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
        marginHorizontal: 4,
    },
    loadingDotMiddle: {
        opacity: 0.6,
    },
});

export default SplashScreen;
