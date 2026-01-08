import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Colors, FontSizes } from './src/constants/Colors';
import { NavigationContext, ScreenName, User } from './src/context/NavigationContext';

// Loading Screen
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Image
      source={require('./assets/logo.png')}
      style={styles.loadingLogoImage}
      resizeMode="contain"
    />
    <Text style={styles.loadingTitle}>VIA AI</Text>
    <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
  </View>
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('loading');
  const [previousScreen, setPreviousScreen] = useState<ScreenName>('chat');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial auth check
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setCurrentScreen('login'); // No stored user, go to login
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Navigation functions
  const navigate = (screen: ScreenName) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setCurrentScreen(previousScreen);
  };

  // Auth functions
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email && password) {
      setUser({
        id: '1',
        name: 'User',
        email: email,
      });
      setCurrentScreen('chat');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCurrentScreen('login');
  };

  // Render current screen
  const renderScreen = () => {
    if (isLoading || currentScreen === 'loading') {
      return <LoadingScreen />;
    }

    switch (currentScreen) {
      case 'login':
        return <LoginScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <ChatScreen />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContext.Provider value={{ navigate, goBack, user, login, logout }}>
          <StatusBar style="light" backgroundColor={Colors.background} />
          {renderScreen()}
        </NavigationContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogoImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  loadingTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 16,
  },
});
