import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { NavigationContext } from '../context/NavigationContext';

interface SettingItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
    danger = false,
}) => (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
    >
        <View style={[styles.iconContainer, danger && styles.iconDanger]}>
            <Ionicons
                name={icon as any}
                size={20}
                color={danger ? Colors.error : Colors.primary}
            />
        </View>
        <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, danger && styles.textDanger]}>
                {title}
            </Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement ? (
            rightElement
        ) : onPress ? (
            <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
            />
        ) : null}
    </TouchableOpacity>
);

const SettingsScreen: React.FC = () => {
    const { goBack, logout, user } = React.useContext(NavigationContext);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const handleClearHistory = () => {
        Alert.alert(
            'Xóa lịch sử',
            'Bạn có chắc chắn muốn xóa tất cả lịch sử trò chuyện?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => console.log('Cleared'),
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', style: 'destructive', onPress: logout },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cài đặt</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Appearance Section */}
                <Text style={styles.sectionTitle}>Giao diện</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="moon-outline"
                        title="Chế độ tối"
                        subtitle="Bật/tắt giao diện tối"
                        rightElement={
                            <Switch
                                value={isDarkMode}
                                onValueChange={setIsDarkMode}
                                trackColor={{ false: Colors.border, true: Colors.primary }}
                                thumbColor={Colors.textPrimary}
                            />
                        }
                    />
                </View>

                {/* Data Section */}
                <Text style={styles.sectionTitle}>Dữ liệu</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="trash-outline"
                        title="Xóa lịch sử chat"
                        subtitle="Xóa tất cả cuộc trò chuyện"
                        onPress={handleClearHistory}
                        danger={true}
                    />
                </View>

                {/* Account Section */}
                <Text style={styles.sectionTitle}>Tài khoản</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="person-outline"
                        title={user?.name || 'Người dùng'}
                        subtitle={user?.email}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="log-out-outline"
                        title="Đăng xuất"
                        subtitle="Thoát khỏi tài khoản"
                        onPress={handleLogout}
                        danger={true}
                    />
                </View>

                {/* About Section */}
                <Text style={styles.sectionTitle}>Thông tin</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="information-circle-outline"
                        title="Về ứng dụng"
                        subtitle="VIA AI - Phiên bản 1.0.0"
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="logo-github"
                        title="Mã nguồn"
                        subtitle="Xem trên GitHub"
                        rightElement={
                            <Ionicons
                                name="open-outline"
                                size={18}
                                color={Colors.textMuted}
                            />
                        }
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="diamond-outline"
                        title="Powered by"
                        subtitle="Google Gemini API"
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerLogo}>V</Text>
                    <Text style={styles.footerText}>VIA AI</Text>
                    <Text style={styles.footerSubtext}>Made with ❤️ by React Native</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
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
        color: Colors.textPrimary,
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
        color: Colors.textSecondary,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
        textTransform: 'uppercase',
    },
    section: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
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
        backgroundColor: Colors.surfaceHover,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    iconDanger: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    settingContent: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    settingTitle: {
        fontSize: FontSizes.base,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    textDanger: {
        color: Colors.error,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.surfaceHover,
        marginLeft: 56,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        marginBottom: Spacing.xxl,
    },
    footerLogo: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.textMuted,
        fontStyle: 'italic',
        opacity: 0.5,
    },
    footerText: {
        fontSize: FontSizes.sm,
        color: Colors.textMuted,
        marginTop: Spacing.xs,
    },
    footerSubtext: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        marginTop: 4,
        opacity: 0.7,
    },
});

export default SettingsScreen;
