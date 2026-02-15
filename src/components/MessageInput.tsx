import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface MessageInputProps {
    onSend: (text: string, enableSearch: boolean) => void;
    isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading }) => {
    const { theme } = useTheme();
    const [text, setText] = useState('');
    const [enableSearch, setEnableSearch] = useState(false);

    const handleSend = () => {
        const trimmed = text.trim();
        if (trimmed && !isLoading) {
            onSend(trimmed, enableSearch);
            setText('');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
            <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {/* Search Toggle */}
                <TouchableOpacity
                    style={[
                        styles.searchToggle,
                        enableSearch && { backgroundColor: theme.primary },
                    ]}
                    onPress={() => setEnableSearch(!enableSearch)}
                >
                    <Ionicons
                        name="search"
                        size={18}
                        color={enableSearch ? '#fff' : theme.textMuted}
                    />
                </TouchableOpacity>

                {/* Input */}
                <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    placeholder="Nhập tin nhắn..."
                    placeholderTextColor={theme.textMuted}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={4000}
                    editable={!isLoading}
                />

                {/* Send Button */}
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        { backgroundColor: text.trim() ? theme.primary : theme.surfaceHover },
                    ]}
                    onPress={handleSend}
                    disabled={!text.trim() || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={theme.textPrimary} />
                    ) : (
                        <Ionicons
                            name="send"
                            size={18}
                            color={text.trim() ? '#fff' : theme.textMuted}
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderWidth: 1,
    },
    searchToggle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.xs,
        marginBottom: 2,
    },
    input: {
        flex: 1,
        fontSize: FontSizes.base,
        maxHeight: 120,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.xs,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.xs,
        marginBottom: 2,
    },
});

export default MessageInput;
