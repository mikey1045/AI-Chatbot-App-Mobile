import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Markdown from 'react-native-markdown-display';
import { Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface ChatBubbleProps {
    message: Message;
    onReload?: (messageId: string) => void;
    onEdit?: (messageId: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onReload, onEdit }) => {
    const { theme } = useTheme();
    const isUser = message.isUser;

    const handleCopy = async () => {
        await Clipboard.setStringAsync(message.text);
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Dynamic markdown styles based on current theme
    const markdownStyles = React.useMemo(() => ({
        body: {
            color: isUser ? theme.userBubbleText : theme.aiBubbleText,
            fontSize: FontSizes.base,
            lineHeight: 22,
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 6,
        },
        strong: {
            fontWeight: '700' as const,
            color: isUser ? theme.userBubbleText : theme.aiBubbleText,
        },
        em: {
            fontStyle: 'italic' as const,
            color: isUser ? theme.userBubbleText : theme.aiBubbleText,
        },
        heading1: {
            fontSize: 20,
            fontWeight: '700' as const,
            color: isUser ? theme.userBubbleText : theme.aiBubbleText,
            marginTop: 8,
            marginBottom: 4,
        },
        heading2: {
            fontSize: 18,
            fontWeight: '700' as const,
            color: isUser ? theme.userBubbleText : theme.aiBubbleText,
            marginTop: 6,
            marginBottom: 4,
        },
        heading3: {
            fontSize: 16,
            fontWeight: '600' as const,
            color: isUser ? theme.userBubbleText : theme.aiBubbleText,
            marginTop: 4,
            marginBottom: 2,
        },
        code_inline: {
            backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : theme.surfaceHover,
            color: isUser ? theme.userBubbleText : theme.primary,
            paddingHorizontal: 5,
            paddingVertical: 2,
            borderRadius: 4,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 13,
        },
        code_block: {
            backgroundColor: isUser ? 'rgba(0,0,0,0.2)' : theme.background,
            borderRadius: 8,
            padding: 12,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 13,
            color: isUser ? theme.userBubbleText : theme.textPrimary,
        },
        fence: {
            backgroundColor: isUser ? 'rgba(0,0,0,0.2)' : theme.background,
            borderRadius: 8,
            padding: 12,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 13,
            color: isUser ? theme.userBubbleText : theme.textPrimary,
            marginVertical: 6,
        },
        blockquote: {
            backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : theme.surfaceHover,
            borderLeftColor: theme.primary,
            borderLeftWidth: 3,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginVertical: 4,
        },
        list_item: {
            marginVertical: 2,
        },
        bullet_list: {
            marginVertical: 4,
        },
        ordered_list: {
            marginVertical: 4,
        },
        bullet_list_icon: {
            color: isUser ? theme.userBubbleText : theme.primary,
            marginRight: 6,
        },
        ordered_list_icon: {
            color: isUser ? theme.userBubbleText : theme.primary,
            marginRight: 6,
        },
        hr: {
            backgroundColor: isUser ? 'rgba(255,255,255,0.3)' : theme.border,
            height: 1,
            marginVertical: 8,
        },
        link: {
            color: isUser ? '#93C5FD' : theme.primary,
            textDecorationLine: 'underline' as const,
        },
        table: {
            borderWidth: 1,
            borderColor: isUser ? 'rgba(255,255,255,0.3)' : theme.border,
            borderRadius: 4,
            marginVertical: 4,
        },
        thead: {
            backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : theme.surfaceHover,
        },
        th: {
            padding: 6,
            color: isUser ? theme.userBubbleText : theme.textPrimary,
            fontWeight: '600' as const,
        },
        td: {
            padding: 6,
            color: isUser ? theme.userBubbleText : theme.aiBubbleText,
        },
        tr: {
            borderBottomWidth: 1,
            borderColor: isUser ? 'rgba(255,255,255,0.2)' : theme.border,
        },
    }), [theme, isUser]);

    return (
        <View style={[styles.container, isUser && styles.userContainer]}>
            <View
                style={[
                    styles.bubble,
                    isUser
                        ? [styles.userBubble, { backgroundColor: theme.userBubble }]
                        : [styles.aiBubble, { backgroundColor: theme.aiBubble }],
                ]}
            >
                {!isUser && (
                    <View style={styles.aiHeader}>
                        <Ionicons name="sparkles" size={14} color={theme.primary} />
                        <Text style={[styles.aiLabel, { color: theme.primary }]}>VIA AI</Text>
                    </View>
                )}

                {isUser ? (
                    // User messages: plain text
                    <Text
                        style={[
                            styles.messageText,
                            { color: theme.userBubbleText },
                        ]}
                        selectable={true}
                    >
                        {message.text}
                    </Text>
                ) : (
                    // AI messages: rendered markdown
                    <Markdown style={markdownStyles}>
                        {message.text}
                    </Markdown>
                )}

                <View style={styles.footer}>
                    <Text
                        style={[
                            styles.timestamp,
                            { color: isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted },
                        ]}
                    >
                        {formatTime(message.timestamp)}
                    </Text>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleCopy} style={styles.actionButton}>
                            <Ionicons
                                name="copy-outline"
                                size={14}
                                color={isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted}
                            />
                        </TouchableOpacity>

                        {isUser && onEdit && (
                            <TouchableOpacity
                                onPress={() => onEdit(message.id)}
                                style={styles.actionButton}
                            >
                                <Ionicons
                                    name="pencil-outline"
                                    size={14}
                                    color="rgba(255,255,255,0.7)"
                                />
                            </TouchableOpacity>
                        )}

                        {onReload && (
                            <TouchableOpacity
                                onPress={() => onReload(message.id)}
                                style={styles.actionButton}
                            >
                                <Ionicons
                                    name="reload-outline"
                                    size={14}
                                    color={isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.xs,
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    bubble: {
        maxWidth: '85%',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        borderBottomLeftRadius: 4,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    aiLabel: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        marginLeft: 4,
    },
    messageText: {
        fontSize: FontSizes.base,
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    timestamp: {
        fontSize: 10,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    actionButton: {
        padding: 4,
    },
});

export default ChatBubble;
