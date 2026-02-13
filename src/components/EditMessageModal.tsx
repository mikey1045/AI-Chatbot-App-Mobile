import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';

interface EditMessageModalProps {
    visible: boolean;
    messageText: string;
    onCancel: () => void;
    onSubmit: (editedText: string) => void;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({
    visible,
    messageText,
    onCancel,
    onSubmit,
}) => {
    const [editedText, setEditedText] = useState(messageText);

    useEffect(() => {
        if (visible) {
            setEditedText(messageText);
        }
    }, [visible, messageText]);

    const handleSubmit = () => {
        const trimmed = editedText.trim();
        if (trimmed.length > 0) {
            onSubmit(trimmed);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    style={styles.centeredView}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Ionicons name="create-outline" size={20} color={Colors.primary} />
                            <Text style={styles.headerTitle}>Chỉnh sửa tin nhắn</Text>
                            <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={22} color={Colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {/* Enlarged chat bubble with editable text */}
                        <ScrollView
                            style={styles.bubbleScroll}
                            contentContainerStyle={styles.bubbleScrollContent}
                            showsVerticalScrollIndicator={true}
                        >
                            <View style={styles.editBubble}>
                                <TextInput
                                    style={styles.editInput}
                                    value={editedText}
                                    onChangeText={setEditedText}
                                    multiline
                                    autoFocus
                                    placeholder="Nhập tin nhắn..."
                                    placeholderTextColor={Colors.textMuted}
                                    selectionColor={Colors.primary}
                                    textAlignVertical="top"
                                />
                            </View>
                        </ScrollView>

                        {/* Action buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={onCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelBtnText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.submitBtn,
                                    editedText.trim().length === 0 && styles.submitBtnDisabled
                                ]}
                                onPress={handleSubmit}
                                activeOpacity={0.7}
                                disabled={editedText.trim().length === 0}
                            >
                                <Ionicons name="send" size={16} color="#FFF" style={{ marginRight: 6 }} />
                                <Text style={styles.submitBtnText}>Gửi lại</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        flex: 1,
        fontSize: FontSizes.base,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginLeft: Spacing.sm,
    },
    bubbleScroll: {
        maxHeight: 500,
    },
    bubbleScrollContent: {
        padding: Spacing.base,
    },
    editBubble: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        minHeight: 150,
    },
    editInput: {
        fontSize: FontSizes.base,
        lineHeight: 24,
        color: Colors.textPrimary,
        minHeight: 200,
    },
    buttonRow: {
        flexDirection: 'row',
        padding: Spacing.base,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: FontSizes.base,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    submitBtn: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        fontSize: FontSizes.base,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default EditMessageModal;
