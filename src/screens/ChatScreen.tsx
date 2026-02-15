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
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import ChatBubble, { Message } from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import ModelSelector from '../components/ModelSelector';
import SideMenu from '../components/SideMenu';
import EditMessageModal from '../components/EditMessageModal';
import { Spacing, FontSizes } from '../constants/Colors';
import { streamMessageToGemini, GEMINI_MODELS } from '../services/geminiService';
import {
    ChatSession,
    createSession,
    getSessions,
    getSessionMessages,
    saveSession,
    deleteSession,
    migrateLegacyData,
    restoreFromCloudIfNeeded
} from '../services/chatStorage';

// Demo messages for UI preview
const DEMO_MESSAGES: Message[] = [];
const MODEL_STORAGE_KEY = 'selected_gemini_model';

const ChatScreen: React.FC = () => {
    const { navigate, user } = React.useContext(NavigationContext);
    const { theme, isDarkMode } = useTheme();

    // State
    const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>(GEMINI_MODELS[0].id);

    // Edit modal state
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    // Refs
    const flatListRef = useRef<FlatList>(null);
    const aiMessageIdRef = useRef<string>('');
    const isLoadedRef = useRef(false);

    // Initial Data Load
    useEffect(() => {
        const initialize = async () => {
            try {
                await restoreFromCloudIfNeeded();
                await migrateLegacyData();
                const loadedSessions = await getSessions();
                setSessions(loadedSessions);
                await handleNewChat(false);
                const savedModel = await AsyncStorage.getItem(MODEL_STORAGE_KEY);
                if (savedModel) {
                    setSelectedModel(savedModel);
                }
            } catch (e) {
                console.error("Failed to initialize chat", e);
            } finally {
                isLoadedRef.current = true;
            }
        };

        initialize();
    }, []);

    // Save messages to current session whenever they change
    useEffect(() => {
        const savecurrentSession = async () => {
            if (!isLoadedRef.current || !currentSessionId) return;
            if (messages.length === 0) return;

            try {
                await saveSession(currentSessionId, messages);
                const updatedSessions = await getSessions();
                setSessions(updatedSessions);
            } catch (e) {
                console.error("Failed to save session", e);
            }
        };

        const timeoutId = setTimeout(savecurrentSession, 500);
        return () => clearTimeout(timeoutId);
    }, [messages, currentSessionId]);

    const handleModelSelect = async (modelId: string) => {
        setSelectedModel(modelId);
        try {
            await AsyncStorage.setItem(MODEL_STORAGE_KEY, modelId);
        } catch (e) {
            console.error("Failed to save model preference", e);
        }
    };

    const handleSend = async (text: string, enableSearch: boolean) => {
        if (!currentSessionId) return;

        const currentHistory = [...messages];
        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            isUser: true,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        setIsLoading(true);
        setIsTyping(true);

        const aiMessageId = (Date.now() + 1).toString();
        aiMessageIdRef.current = aiMessageId;
        let hasAddedAiMessage = false;

        try {
            await streamMessageToGemini(
                text,
                currentHistory,
                (streamedText) => {
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
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === aiMessageId
                                    ? { ...msg, text: streamedText }
                                    : msg
                            )
                        );
                    }
                },
                selectedModel,
                user?.name,
                enableSearch
            );
        } catch (error) {
            setIsTyping(false);
            const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
            Alert.alert('Lỗi', errorMessage);

            if (hasAddedAiMessage) {
                setMessages((prev) => prev.filter(msg => msg.id !== aiMessageId));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleMenuPress = () => {
        setIsSideMenuVisible(true);
    };

    const handleSessionSelect = async (sessionId: string) => {
        if (sessionId === currentSessionId) {
            setIsSideMenuVisible(false);
            return;
        }

        setIsSideMenuVisible(false);
        setMessages([]);
        setIsLoading(true);

        try {
            const msgs = await getSessionMessages(sessionId);
            setCurrentSessionId(sessionId);
            setMessages(msgs);
        } catch (e) {
            console.error("Failed to switch session", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = async (shouldCloseMenu = true) => {
        if (shouldCloseMenu) setIsSideMenuVisible(false);
        const newId = Date.now().toString();
        setCurrentSessionId(newId);
        setMessages([]);
    };

    const handleDeleteSession = async (sessionId: string) => {
        try {
            await deleteSession(sessionId);
            const updatedSessions = await getSessions();
            setSessions(updatedSessions);

            if (sessionId === currentSessionId) {
                if (updatedSessions.length > 0) {
                    handleSessionSelect(updatedSessions[0].id);
                } else {
                    handleNewChat(false);
                }
            }
        } catch (e) {
            console.error("Failed to delete session", e);
        }
    };

    const handleReload = async (messageId: string) => {
        if (isLoading) return;

        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;

        const targetMessage = messages[messageIndex];

        if (targetMessage.isUser) {
            const previousMessages = messages.slice(0, messageIndex);
            setMessages(previousMessages);
            setTimeout(() => {
                handleSend(targetMessage.text, false);
            }, 100);
        } else {
            let userMsgIndex = messageIndex - 1;
            while (userMsgIndex >= 0 && !messages[userMsgIndex].isUser) {
                userMsgIndex--;
            }
            if (userMsgIndex >= 0) {
                const userMsg = messages[userMsgIndex];
                const previousMessages = messages.slice(0, userMsgIndex);
                setMessages(previousMessages);
                setTimeout(() => {
                    handleSend(userMsg.text, false);
                }, 100);
            }
        }
    };

    const handleEditPress = (messageId: string) => {
        const msg = messages.find(m => m.id === messageId);
        if (msg) {
            setEditingMessage(msg);
            setIsEditModalVisible(true);
        }
    };

    const handleEditSubmit = (editedText: string) => {
        if (!editingMessage) return;

        const messageIndex = messages.findIndex(m => m.id === editingMessage.id);
        if (messageIndex === -1) return;

        const previousMessages = messages.slice(0, messageIndex);
        setMessages(previousMessages);
        setIsEditModalVisible(false);
        setEditingMessage(null);

        setTimeout(() => {
            handleSend(editedText, false);
        }, 100);
    };

    const handleSettingsPress = () => {
        setIsSideMenuVisible(false);
        navigate('settings');
    };

    useEffect(() => {
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
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>VIA AI</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Bắt đầu cuộc trò chuyện mới</Text>
            <View style={{ marginTop: 20 }}>
                <Text style={{ color: theme.textMuted, fontSize: 12 }}>Model hiện tại: {GEMINI_MODELS.find(m => m.id === selectedModel)?.name}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            <SideMenu
                isVisible={isSideMenuVisible}
                sessions={sessions}
                currentSessionId={currentSessionId}
                onClose={() => setIsSideMenuVisible(false)}
                onSelectSession={handleSessionSelect}
                onNewChat={() => handleNewChat(true)}
                onDeleteSession={handleDeleteSession}
                onSettingsPress={handleSettingsPress}
            />

            <Header
                onMenuPress={handleMenuPress}
                onNewChatPress={() => handleNewChat(false)}
            />

            <ModelSelector
                selectedModelId={selectedModel}
                onSelectModel={handleModelSelect}
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
                    renderItem={({ item }) => (
                        <ChatBubble
                            message={item}
                            onReload={handleReload}
                            onEdit={item.isUser ? handleEditPress : undefined}
                        />
                    )}
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

            {/* Edit Message Modal */}
            <EditMessageModal
                visible={isEditModalVisible}
                messageText={editingMessage?.text || ''}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingMessage(null);
                }}
                onSubmit={handleEditSubmit}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginTop: Spacing.base,
    },
    emptySubtitle: {
        fontSize: FontSizes.base,
        marginTop: Spacing.sm,
    },
});

export default ChatScreen;
