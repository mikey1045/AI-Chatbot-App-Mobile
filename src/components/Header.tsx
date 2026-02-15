import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
    onMenuPress: () => void;
    onNewChatPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuPress, onNewChatPress }) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
            <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
                <Ionicons name="menu" size={24} color={theme.textPrimary} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
                <Text style={[styles.title, { color: theme.textPrimary }]}>VIA AI</Text>
            </View>

            <TouchableOpacity style={styles.newChatButton} onPress={onNewChatPress}>
                <Ionicons name="create-outline" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    menuButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage: {
        width: 28,
        height: 28,
        marginRight: Spacing.xs,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    newChatButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
    },
});

export default Header;
