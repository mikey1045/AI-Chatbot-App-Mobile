import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet } from 'react-native';
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

// Inner app that uses theme context
const AppContent = () => {
  const { theme, isDarkMode } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  const [previousScreen, setPreviousScreen] = useState<ScreenName>('chat');
  const [user, setUser] = useState<User | null>(null);
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const authResultRef = useRef<{ user: User | null; screen: ScreenName }>({ user: null, screen: 'login' });
  const lastAuthUidRef = useRef<string | null | undefined>(undefined); // undefined = not yet received

  // Run auto-login in background (native only, web returns null)
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const autoUser = await tryAutoSignIn();
        if (autoUser) {
          setCurrentUserId(autoUser.uid);
          const userData: User = {
            id: autoUser.uid,
            name: autoUser.displayName || autoUser.email?.split('@')[0] || 'User',
            email: autoUser.email || '',
          };
          authResultRef.current = { user: userData, screen: 'chat' };
          lastAuthUidRef.current = autoUser.uid;
          setIsAuthChecked(true);
        }
      } catch (error) {
        console.log('Auto sign-in skipped');
      }
    };

    autoLogin();
  }, []);

  // Listen to Firebase auth state changes (runs once, never re-subscribes)
  // On web, this is the primary way to detect previously logged-in users
  // On native, tryAutoSignIn handles initial login, this catches subsequent changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      const newUid = firebaseUser?.uid ?? null;
      const previousUid = lastAuthUidRef.current;

      // Update tracking
      lastAuthUidRef.current = newUid;

      if (firebaseUser) {
        setCurrentUserId(firebaseUser.uid);
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
        };

        if (!isAuthChecked) {
          // During splash - store for later navigation
          authResultRef.current = { user: userData, screen: 'chat' };
          setIsAuthChecked(true);
        } else if (previousUid !== newUid) {
          // After splash - only navigate if user actually changed (new login)
          setUser(userData);
          setCurrentScreen('chat');
        }
      } else {
        if (!isAuthChecked) {
          authResultRef.current = { user: null, screen: 'login' };
          setIsAuthChecked(true);
        } else if (previousUid !== null && previousUid !== undefined) {
          // User signed out (was logged in before)
          setCurrentUserId(null);
          setUser(null);
          setCurrentScreen('login');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // When both splash animation and auth check are done, navigate
  useEffect(() => {
    if (isSplashDone && isAuthChecked) {
      const { user: authUser, screen } = authResultRef.current;
      if (authUser) {
        setUser(authUser);
      }
      setCurrentScreen(screen);
    }
  }, [isSplashDone, isAuthChecked]);


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

  const handleSplashFinish = useCallback(() => {
    setIsSplashDone(true);
  }, []);

  const renderScreen = () => {
    if (currentScreen === 'splash') {
      return <SplashScreen onFinish={handleSplashFinish} />;
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

