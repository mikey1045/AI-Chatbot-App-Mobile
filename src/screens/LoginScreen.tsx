import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { NavigationContext } from '../context/NavigationContext';

const LoginScreen: React.FC = () => {
    const { login } = React.useContext(NavigationContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Vui lòng nhập email và mật khẩu');
            return;
        }
        setError('');
        setIsLoading(true);
        const success = await login(email, password);
        setIsLoading(false);
        if (!success) {
            setError('Đăng nhập thất bại');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>Chào mừng trở lại</Text>
                        <Text style={styles.subtitle}>
                            Đăng nhập để tiếp tục với VIA AI
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={Colors.textMuted}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@example.com"
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Mật khẩu</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color={Colors.textMuted}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor={Colors.textMuted}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color={Colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Error Message */}
                        {error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : null}

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={Colors.textPrimary} />
                            ) : (
                                <Text style={styles.loginButtonText}>Đăng nhập</Text>
                            )}
                        </TouchableOpacity>

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up */}
                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>Chưa có tài khoản? </Text>
                        <TouchableOpacity>
                            <Text style={styles.signUpLink}>Đăng ký ngay</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logoWrapper: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.base,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.base,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        marginBottom: Spacing.xl,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: FontSizes.base,
        color: Colors.textPrimary,
    },
    eyeButton: {
        padding: Spacing.sm,
    },
    errorText: {
        color: Colors.error,
        fontSize: FontSizes.sm,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: FontSizes.base,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    forgotPasswordText: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
    },
    signUpLink: {
        fontSize: FontSizes.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
});

export default LoginScreen;
