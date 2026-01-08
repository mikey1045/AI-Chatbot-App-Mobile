import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../constants/Colors';

interface HeaderProps {
    title?: string;
    showMenu?: boolean;
    showNewChat?: boolean;
    onMenuPress?: () => void;
    onNewChatPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    title = 'VIA AI',
    showMenu = true,
    showNewChat = true,
    onMenuPress,
    onNewChatPress,
}) => {
    return (
        <View style={styles.container}>
            {showMenu && (
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onMenuPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="menu-outline" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
            )}

            <View style={styles.titleContainer}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
                <Text style={styles.title}>{title}</Text>
            </View>

            {showNewChat && (
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onNewChatPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="create-outline" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.base,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage: {
        width: 30,
        height: 30,
        marginRight: Spacing.sm,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
});

export default Header;
