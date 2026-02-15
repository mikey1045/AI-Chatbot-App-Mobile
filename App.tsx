import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { FontSizes } from './src/constants/Colors';
import { NavigationContext, ScreenName, User } from './src/context/NavigationContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import {
  subscribeToAuthChanges,
  signOutUser,
  tryAutoSignIn,
  User as FirebaseUser
} from './src/config/firebaseConfig';
import { setCurrentUserId } from './src/services/chatStorage';

// Loading Screen - uses theme
const LoadingScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
      <Image
        source={require('./assets/logo.png')}
        style={styles.loadingLogoImage}
        resizeMode="contain"
      />
      <Text style={[styles.loadingTitle, { color: theme.textPrimary }]}>VIA AI</Text>
      <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
    </View>
  );
};

// Inner app that uses theme context
const AppContent = () => {
  const { theme, isDarkMode } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('loading');
  const [previousScreen, setPreviousScreen] = useState<ScreenName>('chat');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Thử tự động đăng nhập khi mở app
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const autoUser = await tryAutoSignIn();
        if (autoUser) {
          setCurrentUserId(autoUser.uid);
          setUser({
            id: autoUser.uid,
            name: autoUser.displayName || autoUser.email?.split('@')[0] || 'User',
            email: autoUser.email || '',
          });
          setCurrentScreen('chat');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('Auto sign-in skipped');
      }

      setIsLoading(false);
      setCurrentScreen('login');
    };

    autoLogin();
  }, []);

  // Handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setCurrentUserId(firebaseUser.uid);
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
        });
        setCurrentScreen('chat');
      } else if (!isLoading) {
        setCurrentUserId(null);
        setUser(null);
        setCurrentScreen('login');
      }
    });

    return () => unsubscribe();
  }, [isLoading]);

  const navigate = (screen: ScreenName) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setCurrentScreen(previousScreen);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    return false;
  };

  const loginWithFirebaseUser = (firebaseUser: FirebaseUser) => {
    setUser({
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email: firebaseUser.email || '',
    });
    setCurrentScreen('chat');
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setCurrentScreen('login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
    <NavigationContext.Provider value={{ navigate, goBack, user, login, loginWithFirebaseUser, logout }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={theme.background} />
      {renderScreen()}
    </NavigationContext.Provider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
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
    marginTop: 16,
  },
});
