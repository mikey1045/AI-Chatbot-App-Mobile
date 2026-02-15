import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { NavigationContext } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';
import { signInWithGoogle } from '../config/firebaseConfig';

const LoginScreen: React.FC = () => {
    const { loginWithFirebaseUser } = React.useContext(NavigationContext);
    const { theme, isDarkMode } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);

        try {
            const user = await signInWithGoogle();
            loginWithFirebaseUser(user);
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Background gradient effect */}
            <View style={[styles.backgroundGradient, { backgroundColor: theme.primary }]} />

            {/* Content */}
            <View style={styles.content}>
                {/* Logo & Title */}
                <View style={styles.header}>
                    <View style={[styles.logoContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                        <Ionicons name="chatbubbles" size={60} color={theme.primary} />
                    </View>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>VIA AI</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Trợ lý AI thông minh của bạn</Text>
                </View>

                {/* Login Button */}
                <View style={styles.loginContainer}>
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color={theme.error} />
                            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.googleButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                        onPress={handleGoogleSignIn}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Image
                                    source={{ uri: 'https://www.google.com/favicon.ico' }}
                                    style={styles.googleIcon}
                                />
                                <Text style={styles.googleButtonText}>
                                    Đăng nhập bằng Google
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                        Bằng việc đăng nhập, bạn đồng ý với{'\n'}
                        <Text style={{ color: theme.primary }}>Điều khoản sử dụng</Text> và{' '}
                        <Text style={{ color: theme.primary }}>Chính sách bảo mật</Text>
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textMuted }]}>
                        Powered by Gemini AI
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        opacity: 0.1,
        borderBottomLeftRadius: 100,
        borderBottomRightRadius: 100,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSizes.base,
        textAlign: 'center',
    },
    loginContainer: {
        alignItems: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
    },
    errorText: {
        marginLeft: Spacing.xs,
        fontSize: FontSizes.sm,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
        width: '100%',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: Spacing.sm,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    googleButtonText: {
        color: '#fff',
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    termsText: {
        marginTop: Spacing.lg,
        fontSize: FontSizes.xs,
        textAlign: 'center',
        lineHeight: 18,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: FontSizes.xs,
    },
});

export default LoginScreen;
