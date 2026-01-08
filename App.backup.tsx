import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Colors';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
    const appTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: Colors.primary,
            background: Colors.background,
            card: Colors.surface,
            text: Colors.textPrimary,
            border: Colors.border,
            notification: Colors.primary,
        },
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AuthProvider>
                    <NavigationContainer theme={appTheme}>
                        <StatusBar style="light" backgroundColor={Colors.background} />
                        <AppNavigator />
                    </NavigationContainer>
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
