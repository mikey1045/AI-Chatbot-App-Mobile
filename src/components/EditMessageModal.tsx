import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface EditMessageModalProps {
    visible: boolean;
    messageText: string;
    onCancel: () => void;
    onSubmit: (text: string) => void;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({
    visible,
    messageText,
    onCancel,
    onSubmit,
}) => {
    const { theme } = useTheme();
    const [text, setText] = useState(messageText);

    useEffect(() => {
        if (visible) {
            setText(messageText);
        }
    }, [visible, messageText]);

    const handleSubmit = () => {
        const trimmed = text.trim();
        if (trimmed) {
            onSubmit(trimmed);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Chỉnh sửa tin nhắn</Text>
                        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Input */}
                    <TextInput
                        style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.background, borderColor: theme.border }]}
                        value={text}
                        onChangeText={setText}
                        multiline
                        autoFocus
                        placeholder="Nhập nội dung..."
                        placeholderTextColor={theme.textMuted}
                    />

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: theme.border }]}
                            onPress={onCancel}
                        >
                            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: text.trim() ? theme.primary : theme.surfaceHover },
                            ]}
                            onPress={handleSubmit}
                            disabled={!text.trim()}
                        >
                            <Ionicons name="send" size={16} color={text.trim() ? '#fff' : theme.textMuted} />
                            <Text
                                style={[
                                    styles.submitText,
                                    { color: text.trim() ? '#fff' : theme.textMuted },
                                ]}
                            >
                                Gửi lại
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    container: {
        width: '100%',
        maxWidth: 500,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.base,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    closeButton: {
        padding: Spacing.xs,
    },
    input: {
        margin: Spacing.base,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        fontSize: FontSizes.base,
        minHeight: 100,
        maxHeight: 200,
        textAlignVertical: 'top',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: Spacing.sm,
        padding: Spacing.base,
        paddingTop: 0,
    },
    cancelButton: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    cancelText: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    submitText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
});

export default EditMessageModal;
