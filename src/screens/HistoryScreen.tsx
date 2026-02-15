import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { NavigationContext } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';
import { ChatSession, getSessions, deleteSession } from '../services/chatStorage';

const HistoryScreen: React.FC = () => {
    const { goBack, navigate } = React.useContext(NavigationContext);
    const { theme, isDarkMode } = useTheme();

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load sessions from storage
    const loadSessions = useCallback(async () => {
        try {
            setIsLoading(true);
            const loadedSessions = await getSessions();
            setSessions(loadedSessions);
        } catch (e) {
            console.error('Failed to load sessions:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Hôm nay';
        if (days === 1) return 'Hôm qua';
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const handleDelete = useCallback((session: ChatSession) => {
        Alert.alert(
            'Xóa cuộc trò chuyện',
            `Bạn có chắc chắn muốn xóa "${session.title}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSession(session.id);
                            setSessions(prev => prev.filter(s => s.id !== session.id));
                        } catch (e) {
                            console.error('Failed to delete session:', e);
                            Alert.alert('Lỗi', 'Không thể xóa cuộc trò chuyện.');
                        }
                    },
                },
            ]
        );
    }, []);

    const handleSelectChat = useCallback((sessionId: string) => {
        // Navigate to chat — the ChatScreen will load this session via SideMenu logic
        navigate('chat');
    }, [navigate]);

    const renderItem = ({ item }: { item: ChatSession }) => (
        <TouchableOpacity
            style={[styles.historyItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => handleSelectChat(item.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.surfaceHover }]}>
                <Ionicons name="chatbubble-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.title || 'Cuộc trò chuyện mới'}
                </Text>
                <Text style={[styles.preview, { color: theme.textSecondary }]} numberOfLines={2}>
                    {item.preview || 'Không có tin nhắn'}
                </Text>
                <Text style={[styles.date, { color: theme.textMuted }]}>
                    {formatDate(item.lastModified)}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons name="trash-outline" size={18} color={theme.error || '#FF4444'} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                Chưa có cuộc trò chuyện nào
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Bắt đầu trò chuyện với VIA AI ngay!
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Lịch sử chat</Text>
                <View style={styles.headerRight}>
                    <Text style={[styles.sessionCount, { color: theme.textMuted }]}>
                        {sessions.length} cuộc trò chuyện
                    </Text>
                </View>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={[
                        styles.listContent,
                        sessions.length === 0 && styles.emptyList,
                    ]}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
    },
    headerTitle: {
        flex: 1,
        fontSize: FontSizes.lg,
        fontWeight: '700',
        marginLeft: Spacing.sm,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    sessionCount: {
        fontSize: FontSizes.xs,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: Spacing.base,
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        borderWidth: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: FontSizes.base,
        fontWeight: '600',
        marginBottom: 4,
    },
    preview: {
        fontSize: FontSizes.sm,
        lineHeight: 18,
        marginBottom: 4,
    },
    date: {
        fontSize: FontSizes.xs,
    },
    deleteBtn: {
        padding: Spacing.sm,
        marginLeft: Spacing.sm,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    emptyTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        marginTop: Spacing.base,
    },
    emptySubtitle: {
        fontSize: FontSizes.base,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
});

export default HistoryScreen;
