import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { GEMINI_MODELS } from '../services/geminiService';

interface ModelSelectorProps {
    selectedModelId: string;
    onSelectModel: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModelId, onSelectModel }) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {GEMINI_MODELS.map((model) => {
                    const isSelected = model.id === selectedModelId;
                    return (
                        <TouchableOpacity
                            key={model.id}
                            style={[
                                styles.modelButton,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                            ]}
                            onPress={() => onSelectModel(model.id)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.modelName,
                                    { color: isSelected ? '#fff' : theme.textPrimary },
                                ]}
                            >
                                {model.name}
                            </Text>
                            {model.isNew && (
                                <View style={[styles.newBadge, isSelected && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                                    <Text style={[styles.newBadgeText, isSelected && { color: '#fff' }]}>NEW</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.base,
        gap: Spacing.sm,
    },
    modelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    modelName: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
    newBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 6,
    },
    newBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#EF4444',
    },
});

export default ModelSelector;
