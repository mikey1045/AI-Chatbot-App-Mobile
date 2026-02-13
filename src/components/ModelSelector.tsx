import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { GEMINI_MODELS } from '../services/geminiService';

interface ModelSelectorProps {
    selectedModelId: string;
    onSelectModel: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModelId, onSelectModel }) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {GEMINI_MODELS.map((model) => (
                    <TouchableOpacity
                        key={model.id}
                        style={[
                            styles.modelButton,
                            selectedModelId === model.id && styles.selectedModelButton
                        ]}
                        onPress={() => onSelectModel(model.id)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.modelText,
                                selectedModelId === model.id && styles.selectedModelText
                            ]}
                        >
                            {model.name}
                        </Text>
                        {model.isNew && (
                            <View style={styles.newBadge}>
                                <Text style={styles.newBadgeText}>MỚI</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    contentContainer: {
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
    },
    modelButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    selectedModelButton: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    modelText: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    selectedModelText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    newBadge: {
        backgroundColor: Colors.error,
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginLeft: 6,
    },
    newBadgeText: {
        fontSize: 8,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default ModelSelector;
