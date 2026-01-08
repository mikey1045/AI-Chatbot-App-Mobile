import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';

export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface ChatBubbleProps {
    message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const isUser = message.isUser;

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
                    style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.aiText,
                    ]}
                >
                    {message.text}
                </Text>
                <Text style={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
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
    timestamp: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        marginTop: Spacing.xs,
        alignSelf: 'flex-end',
    },
});

export default ChatBubble;
