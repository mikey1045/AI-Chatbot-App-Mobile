import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';

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
    const isUser = message.isUser;
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        await Clipboard.setStringAsync(message.text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <View
            style={[
                styles.container,
                isUser ? styles.userContainer : styles.aiContainer,
            ]}
        >
            {!isUser && (
                <View style={styles.avatarContainer}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.avatarImage}
                        resizeMode="contain"
                    />
                </View>
            )}

            <View
                style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                ]}
            >
                <Text
                    selectable={true}
                    selectionColor={Colors.primary + '66'}
                    style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.aiText,
                    ]}
                >
                    {message.text}
                </Text>

                <View style={styles.footerContainer}>
                    <Text style={styles.timestamp}>
                        {message.timestamp.toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>

                    <View style={styles.actionButtons}>
                        {/* Copy button */}
                        <TouchableOpacity
                            onPress={handleCopy}
                            style={styles.actionBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name={isCopied ? "checkmark" : "copy-outline"}
                                size={14}
                                color={isCopied ? Colors.primary : Colors.textMuted}
                            />
                        </TouchableOpacity>

                        {/* Edit button - only for user messages */}
                        {isUser && onEdit && (
                            <TouchableOpacity
                                onPress={() => onEdit(message.id)}
                                style={styles.actionBtn}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="create-outline" size={14} color={Colors.textMuted} />
                            </TouchableOpacity>
                        )}

                        {/* Reload button - only for user messages */}
                        {isUser && onReload && (
                            <TouchableOpacity
                                onPress={() => onReload(message.id)}
                                style={styles.actionBtn}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="reload-outline" size={14} color={Colors.textMuted} />
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
        flexDirection: 'row',
        marginVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    aiContainer: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
        marginTop: 4,
    },
    avatarImage: {
        width: 20,
        height: 20,
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    userBubble: {
        backgroundColor: Colors.userBubble,
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: Colors.aiBubble,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    messageText: {
        fontSize: FontSizes.base,
        lineHeight: 22,
    },
    userText: {
        color: Colors.userBubbleText,
    },
    aiText: {
        color: Colors.aiBubbleText,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.xs,
        minWidth: 60,
    },
    timestamp: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionBtn: {
        padding: 4,
        borderRadius: 4,
    },
    copiedText: {
        fontSize: 10,
        color: Colors.primary,
        marginLeft: 4,
        fontWeight: '500',
    }
});

export default ChatBubble;
