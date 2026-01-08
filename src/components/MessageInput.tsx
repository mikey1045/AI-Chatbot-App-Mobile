import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes } from '../constants/Colors';

interface MessageInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading = false }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim() && !isLoading) {
            onSend(text.trim());
            setText('');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập tin nhắn..."
                    placeholderTextColor={Colors.textMuted}
                    value={text}
                    onChangeText={setText}
                    multiline={true}
                    maxLength={2000}
                    editable={!isLoading}
                    onSubmitEditing={handleSend}
                />

                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!text.trim() || isLoading) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!text.trim() || isLoading}
                    activeOpacity={0.7}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={Colors.textPrimary} />
                    ) : (
                        <Ionicons
                            name="send"
                            size={20}
                            color={text.trim() ? Colors.textPrimary : Colors.textMuted}
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: FontSizes.base,
        color: Colors.textPrimary,
        maxHeight: 100,
        paddingVertical: Spacing.sm,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.sm,
    },
    sendButtonDisabled: {
        backgroundColor: Colors.surfaceHover,
    },
});

export default MessageInput;
