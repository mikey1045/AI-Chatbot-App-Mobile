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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContext } from '../context/NavigationContext';

import Header from '../components/Header';
import ChatBubble, { Message } from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import { Colors, Spacing, FontSizes } from '../constants/Colors';

// Demo messages for UI preview
const DEMO_MESSAGES: Message[] = [];

const ChatScreen: React.FC = () => {
    const { navigate } = React.useContext(NavigationContext);
    const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async (text: string) => {
        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            isUser: true,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Simulate AI response
        setIsLoading(true);
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Đây là phản hồi mẫu từ VIA AI. Trong phiên bản hoàn chỉnh, tin nhắn này sẽ được tạo bởi Gemini API.',
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1500);
    };

    const onMenuPress = () => {
        navigate('settings');
    };

    const handleNewChat = () => {
        setMessages([]);
    };

    useEffect(() => {
        // Scroll to bottom when new message arrives
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

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
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            <Header
                onMenuPress={onMenuPress}
                onNewChatPress={handleNewChat}
            />

            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ChatBubble message={item} />}
                    contentContainerStyle={[
                        styles.messageList,
                        messages.length === 0 && styles.emptyList,
                    ]}
                    ListEmptyComponent={renderEmptyState}
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
