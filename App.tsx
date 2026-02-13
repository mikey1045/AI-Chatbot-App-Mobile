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
import {
  subscribeToAuthChanges,
  signOutUser,
  tryAutoSignIn,
  User as FirebaseUser
} from './src/config/firebaseConfig';
import { setCurrentUserId } from './src/services/chatStorage';

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

  // Thử tự động đăng nhập khi mở app
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const autoUser = await tryAutoSignIn();
        if (autoUser) {
          // Set user ID cho chat storage
          setCurrentUserId(autoUser.uid);
          setUser({
            id: autoUser.uid,
            name: autoUser.displayName || autoUser.email?.split('@')[0] || 'User',
            email: autoUser.email || '',
          });
          setCurrentScreen('chat');
          setIsLoading(false);
          return; // Đã đăng nhập thành công, không cần subscribe
        }
      } catch (error) {
        console.log('Auto sign-in skipped');
      }

      // Nếu không auto login được, subscribe để chờ đăng nhập
      setIsLoading(false);
      setCurrentScreen('login');
    };

    autoLogin();
  }, []);

  // Handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in - set user ID cho chat storage
        setCurrentUserId(firebaseUser.uid);
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
        });
        setCurrentScreen('chat');
      } else if (!isLoading) {
        // User is signed out - clear user ID
        setCurrentUserId(null);
        setUser(null);
        setCurrentScreen('login');
      }
    });

    return () => unsubscribe();
  }, [isLoading]);

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
    // Not used with Google Sign-In
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
        <NavigationContext.Provider value={{ navigate, goBack, user, login, loginWithFirebaseUser, logout }}>
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
