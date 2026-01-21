import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Text,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContext } from '../context/NavigationContext';

import Header from '../components/Header';
import ChatBubble, { Message } from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import { Colors, Spacing, FontSizes } from '../constants/Colors';
import { streamMessageToGemini, resetChatHistory } from '../services/geminiService';

// Demo messages for UI preview
const DEMO_MESSAGES: Message[] = [];

const ChatScreen: React.FC = () => {
    const { navigate } = React.useContext(NavigationContext);
    const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const aiMessageIdRef = useRef<string>('');

    const handleSend = async (text: string) => {
        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            isUser: true,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Show typing indicator while waiting for API
        setIsLoading(true);
        setIsTyping(true);

        // Create AI message ID for streaming updates
        const aiMessageId = (Date.now() + 1).toString();
        aiMessageIdRef.current = aiMessageId;
        let hasAddedAiMessage = false;

        try {
            // Stream the response - typing indicator stays until first chunk
            await streamMessageToGemini(text, (streamedText) => {
                // On first chunk, hide typing indicator and add AI message
                if (!hasAddedAiMessage) {
                    hasAddedAiMessage = true;
                    setIsTyping(false);

                    const aiMessage: Message = {
                        id: aiMessageId,
                        text: streamedText,
                        isUser: false,
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, aiMessage]);
                } else {
                    // Update existing AI message with new text
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === aiMessageId
                                ? { ...msg, text: streamedText }
                                : msg
                        )
                    );
                }
            });
        } catch (error) {
            setIsTyping(false);
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
            Alert.alert('Lỗi', errorMessage);
            // Remove the empty AI message if error occurred
            if (hasAddedAiMessage) {
                setMessages((prev) => prev.filter(msg => msg.id !== aiMessageId));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const onMenuPress = () => {
        navigate('settings');
    };

    const handleNewChat = () => {
        setMessages([]);
        resetChatHistory();
    };

    useEffect(() => {
        // Scroll to bottom when new message arrives or typing
        if (flatListRef.current && (messages.length > 0 || isTyping)) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isTyping]);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Image
                source={require('../../assets/logo.png')}
                style={styles.emptyLogoImage}
                resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>VIA AI</Text>
            <Text style={styles.emptySubtitle}>Bắt đầu cuộc trò chuyện mới</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            <Header
                onMenuPress={onMenuPress}
                onNewChatPress={handleNewChat}
            />

            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ChatBubble message={item} />}
                    contentContainerStyle={[
                        styles.messageList,
                        messages.length === 0 && !isTyping && styles.emptyList,
                    ]}
                    ListEmptyComponent={!isTyping ? renderEmptyState : null}
                    ListFooterComponent={isTyping ? <TypingIndicator /> : null}
                    showsVerticalScrollIndicator={false}
                />

                <MessageInput onSend={handleSend} isLoading={isLoading} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
    },
    messageList: {
        paddingVertical: Spacing.md,
        flexGrow: 1,
    },
    emptyList: {
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    emptyLogoImage: {
        width: 120,
        height: 120,
        marginBottom: Spacing.sm,
    },
    emptyTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: Spacing.base,
    },
    emptySubtitle: {
        fontSize: FontSizes.base,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
    },
});

export default ChatScreen;
