import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SplashScreen from './src/screens/SplashScreen';
import { NavigationContext, ScreenName, User } from './src/context/NavigationContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import {
  subscribeToAuthChanges,
  signOutUser,
  tryAutoSignIn,
  User as FirebaseUser
} from './src/config/firebaseConfig';
import { setCurrentUserId } from './src/services/chatStorage';

// Splash Screen component is now being used from src/screens/SplashScreen.tsx

// Inner app that uses theme context
const AppContent = () => {
  const { theme, isDarkMode } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('loading');
  const [previousScreen, setPreviousScreen] = useState<ScreenName>('chat');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSplashFinished, setIsSplashFinished] = useState(false);

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

  // Handle Firebase auth state changes — SINGLE SOURCE OF TRUTH
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        // Cập nhật storage user ID TRƯỚC khi thay đổi state/screen
        setCurrentUserId(firebaseUser.uid);
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
        });
        setCurrentScreen('chat');
      } else if (!isLoading) {
        // Xóa storage user ID TRƯỚC khi chuyển màn hình
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

  const loginWithFirebaseUser = (_firebaseUser: FirebaseUser) => {
    // Không cần làm gì ở đây — onAuthStateChanged listener sẽ
    // tự động phát hiện user mới và cập nhật state + screen.
    // Giữ hàm này để không phá vỡ interface NavigationContext.
  };

  const logout = async () => {
    try {
      // Chỉ gọi Firebase signOut — onAuthStateChanged listener sẽ
      // tự động xóa user state, reset currentUserId, và chuyển về login.
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback: nếu Firebase signOut thất bại, vẫn cleanup thủ công
      setCurrentUserId(null);
      setUser(null);
      setCurrentScreen('login');
    }
  };

  const renderScreen = () => {
    if (!isSplashFinished || isLoading || currentScreen === 'loading') {
      return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
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

