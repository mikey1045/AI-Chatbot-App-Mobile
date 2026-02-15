import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Modal,
    Platform,
} from 'react-native';
import { Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { ChatSession } from '../services/chatService';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

interface SideMenuProps {
    isVisible: boolean;
    sessions: ChatSession[];
    currentSessionId: string | null;
    onClose: () => void;
    onSelectSession: (sessionId: string) => void;
    onNewChat: () => void;
    onDeleteSession: (sessionId: string) => void;
    onSettingsPress: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
    isVisible,
    sessions,
    currentSessionId,
    onClose,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    onSettingsPress,
}) => {
    const { theme } = useTheme();
    const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);

    if (!isVisible) return null;

    const handleDeletePress = (session: ChatSession) => {
        setDeleteTarget(session);
    };

    const handleConfirmDelete = () => {
        if (deleteTarget) {
            onDeleteSession(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteTarget(null);
    };

    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
            <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity style={[styles.newChatButton, { backgroundColor: theme.background, borderColor: theme.border }]} onPress={onNewChat}>
                        <Ionicons name="add" size={24} color={theme.textPrimary} />
                        <Text style={[styles.newChatText, { color: theme.textPrimary }]}>Cuộc trò chuyện mới</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.sessionList} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Gần đây</Text>
                    {sessions.map((session) => (
                        <View
                            key={session.id}
                            style={[
                                styles.sessionItem,
                                currentSessionId === session.id && { backgroundColor: theme.background },
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.sessionContent}
                                onPress={() => onSelectSession(session.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="chatbubble-outline"
                                    size={18}
                                    color={currentSessionId === session.id ? theme.primary : theme.textSecondary}
                                    style={{ marginRight: 10 }}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[
                                            styles.sessionTitle,
                                            { color: theme.textPrimary },
                                            currentSessionId === session.id && { color: theme.primary, fontWeight: 'bold' },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {session.title || 'Cuộc trò chuyện mới'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeletePress(session)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close" size={18} color="#FF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <TouchableOpacity style={styles.footerItem} onPress={onSettingsPress}>
                        <Ionicons name="settings-outline" size={24} color={theme.textPrimary} />
                        <Text style={[styles.footerText, { color: theme.textPrimary }]}>Cài đặt</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Custom Delete Confirmation Dialog */}
            <Modal
                visible={deleteTarget !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCancelDelete}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={styles.modalIconWrapper}>
                            <Ionicons name="trash-outline" size={32} color="#FF4444" />
                        </View>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Xóa cuộc trò chuyện</Text>
                        <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
                            Bạn có chắc chắn muốn xóa "{deleteTarget?.title}"?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                                onPress={handleCancelDelete}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmDeleteButton}
                                onPress={handleConfirmDelete}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.confirmDeleteText}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        zIndex: 1000,
        elevation: 1000,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    menuContainer: {
        width: MENU_WIDTH,
        height: '100%',
        flexDirection: 'column',
    },
    header: {
        padding: Spacing.md,
        paddingTop: Platform.OS === 'android' ? 40 : 60,
        borderBottomWidth: 1,
    },
    newChatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    newChatText: {
        marginLeft: Spacing.sm,
        fontSize: FontSizes.base,
        fontWeight: '500',
    },
    sessionList: {
        flex: 1,
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.sm,
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
        fontWeight: '500',
    },
    sessionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.sm,
        marginBottom: 2,
    },
    sessionTitle: {
        fontSize: FontSizes.base,
    },
    sessionContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        padding: 6,
        marginLeft: 4,
    },
    footer: {
        padding: Spacing.md,
        borderTopWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.md,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    footerText: {
        marginLeft: Spacing.sm,
        fontSize: FontSizes.base,
    },
    // Custom Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        width: '80%',
        maxWidth: 340,
        alignItems: 'center',
        borderWidth: 1,
    },
    modalIconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 68, 68, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modalTitle: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        marginBottom: Spacing.sm,
    },
    modalMessage: {
        fontSize: FontSizes.base,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: FontSizes.base,
        fontWeight: '600',
    },
    confirmDeleteButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: '#FF4444',
        alignItems: 'center',
    },
    confirmDeleteText: {
        fontSize: FontSizes.base,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default SideMenu;
