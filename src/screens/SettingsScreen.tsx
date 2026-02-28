import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Image,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { NavigationContext } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';
import { getSessions, deleteSession } from '../services/chatStorage';

interface SettingItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    danger?: boolean;
    theme: any;
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
    danger = false,
    theme,
}) => (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
    >
        <View style={[styles.iconContainer, { backgroundColor: theme.surfaceHover }, danger && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Ionicons
                name={icon as any}
                size={20}
                color={danger ? theme.error : theme.primary}
            />
        </View>
        <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: danger ? theme.error : theme.textPrimary }]}>
                {title}
            </Text>
            {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
        {rightElement ? (
            rightElement
        ) : onPress ? (
            <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textMuted}
            />
        ) : null}
    </TouchableOpacity>
);

const SettingsScreen: React.FC = () => {
    const { goBack, logout, user } = React.useContext(NavigationContext);
    const { theme, isDarkMode, toggleTheme } = useTheme();

    const handleClearHistory = useCallback(() => {
        const title = 'Xóa lịch sử';
        const message = 'Bạn có chắc chắn muốn xóa tất cả lịch sử trò chuyện? Hành động này không thể hoàn tác.';

        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n\n${message}`)) {
                const clear = async () => {
                    try {
                        const sessions = await getSessions();
                        for (const session of sessions) {
                            await deleteSession(session.id);
                        }
                        alert('Thành công: Đã xóa tất cả lịch sử trò chuyện.');
                    } catch (e) {
                        console.error('Failed to clear history:', e);
                        alert('Lỗi: Không thể xóa lịch sử. Vui lòng thử lại.');
                    }
                };
                clear();
            }
            return;
        }

        Alert.alert(
            title,
            message,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa tất cả',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const sessions = await getSessions();
                            for (const session of sessions) {
                                await deleteSession(session.id);
                            }
                            Alert.alert('Thành công', 'Đã xóa tất cả lịch sử trò chuyện.');
                        } catch (e) {
                            console.error('Failed to clear history:', e);
                            Alert.alert('Lỗi', 'Không thể xóa lịch sử. Vui lòng thử lại.');
                        }
                    },
                },
            ]
        );
    }, []);

    const handleLogout = () => {
        const title = 'Đăng xuất';
        const message = 'Bạn có chắc chắn muốn đăng xuất?';

        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n\n${message}`)) {
                logout();
            }
            return;
        }

        Alert.alert(
            title,
            message,
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', style: 'destructive', onPress: logout },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Cài đặt</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Appearance Section */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Giao diện</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem
                        icon="moon-outline"
                        title="Chế độ tối"
                        subtitle="Bật/tắt giao diện tối"
                        theme={theme}
                        rightElement={
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleTheme}
                                trackColor={{ false: theme.border, true: theme.primary }}
                                thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
                            />
                        }
                    />
                </View>

                {/* Data Section */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Dữ liệu</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem
                        icon="trash-outline"
                        title="Xóa lịch sử chat"
                        subtitle="Xóa tất cả cuộc trò chuyện"
                        onPress={handleClearHistory}
                        danger={true}
                        theme={theme}
                    />
                </View>

                {/* Account Section */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Tài khoản</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem
                        icon="person-outline"
                        title={user?.name || 'Người dùng'}
                        subtitle={user?.email}
                        theme={theme}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.surfaceHover }]} />
                    <SettingItem
                        icon="log-out-outline"
                        title="Đăng xuất"
                        subtitle="Thoát khỏi tài khoản"
                        onPress={handleLogout}
                        danger={true}
                        theme={theme}
                    />
                </View>

                {/* About Section */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Thông tin</Text>
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <SettingItem
                        icon="information-circle-outline"
                        title="Về ứng dụng"
                        subtitle="VIA AI - Phiên bản 1.0.0"
                        theme={theme}
                    />

                    <View style={[styles.divider, { backgroundColor: theme.surfaceHover }]} />
                    <SettingItem
                        icon="diamond-outline"
                        title="Powered by"
                        subtitle="Google Gemini API"
                        theme={theme}
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.footerLogoImage}
                        resizeMode="contain"
                    />
                    <Text style={[styles.footerText, { color: theme.textMuted }]}>VIA AI</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: Spacing.base,
    },
    sectionTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
        textTransform: 'uppercase',
    },
    section: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.base,
        minHeight: 56,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    settingContent: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    settingTitle: {
        fontSize: FontSizes.base,
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginLeft: 56,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        marginBottom: Spacing.xxl,
    },
    footerLogoImage: {
        width: 50,
        height: 50,
        opacity: 0.5,
    },
    footerText: {
        fontSize: FontSizes.sm,
        marginTop: Spacing.xs,
    },
    footerSubtext: {
        fontSize: FontSizes.xs,
        marginTop: 4,
        opacity: 0.7,
    },
});

export default SettingsScreen;
