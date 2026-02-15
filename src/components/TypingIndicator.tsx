import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Spacing } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

const TypingIndicator: React.FC = () => {
    const { theme } = useTheme();
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animate = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0.3,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        animate(dot1, 0);
        animate(dot2, 200);
        animate(dot3, 400);
    }, [dot1, dot2, dot3]);

    return (
        <View style={styles.container}>
            <View style={[styles.bubble, { backgroundColor: theme.surface }]}>
                <Animated.View style={[styles.dot, { opacity: dot1, backgroundColor: theme.primary }]} />
                <Animated.View style={[styles.dot, { opacity: dot2, backgroundColor: theme.primary }]} />
                <Animated.View style={[styles.dot, { opacity: dot3, backgroundColor: theme.primary }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.xs,
    },
    bubble: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        borderRadius: 16,
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});

export default TypingIndicator;
