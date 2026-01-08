import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { NavigationContext } from '../context/NavigationContext';

interface ChatHistory {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
}

// Demo history data
const DEMO_HISTORY: ChatHistory[] = [
    {
        id: '1',
        title: 'Giải thích React Native',
        lastMessage: 'React Native là một framework...',
        timestamp: new Date(),
    },
    {
        id: '2',
        title: 'Hỏi về JavaScript',
        lastMessage: 'JavaScript là ngôn ngữ lập trình...',
        timestamp: new Date(Date.now() - 86400000),
    },
    {
        id: '3',
        title: 'Cách sử dụng API',
        lastMessage: 'Để gọi API, bạn có thể sử dụng fetch...',
        timestamp: new Date(Date.now() - 172800000),
    },
];

const HistoryScreen: React.FC = () => {
    const { goBack, navigate } = React.useContext(NavigationContext);

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Hôm nay';
        if (days === 1) return 'Hôm qua';
        return date.toLocaleDateString('vi-VN');
    };

    const handleDelete = (id: string) => {
        // TODO: Implement delete logic
        console.log('Delete chat:', id);
    };

    const handleSelectChat = (id: string) => {
        // TODO: Load chat and navigate
        navigate('chat');
    };

    const renderItem = ({ item }: { item: ChatHistory }) => (
        <TouchableOpacity
            style={styles.historyItem}
            onPress={() => handleSelectChat(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>

            <View style={styles.rightContainer}>
                <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={goBack}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lịch sử trò chuyện</Text>
                <View style={styles.placeholder} />
            </View>

            <FlatList
                data={DEMO_HISTORY}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>Chưa có lịch sử trò chuyện</Text>
                    </View>
                }
            />
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
    list: {
        padding: Spacing.base,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.base,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surfaceHover,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: FontSizes.base,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
    },
    rightContainer: {
        alignItems: 'flex-end',
        marginLeft: Spacing.md,
    },
    timestamp: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        marginBottom: Spacing.sm,
    },
    deleteButton: {
        padding: Spacing.xs,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: FontSizes.base,
        color: Colors.textMuted,
        marginTop: Spacing.base,
    },
});

export default HistoryScreen;
