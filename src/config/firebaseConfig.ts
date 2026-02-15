// Firebase configuration for AI Chatbot - Google Sign-In
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    signInWithCredential,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { Platform } from 'react-native';

// ============================================================
// Lazy-load GoogleSignin để tương thích với Expo Go.
// Expo Go không có native module RNGoogleSignin, nên nếu import
// trực tiếp ở top-level sẽ crash ngay lập tức.
// ============================================================
let GoogleSigninModule: any = null;
let googleSigninStatusCodes: any = null;
let isGoogleSigninAvailable = false;

function getGoogleSignin() {
    if (GoogleSigninModule !== null) return GoogleSigninModule;
    if (Platform.OS === 'web') return null;
    try {
        const mod = require('@react-native-google-signin/google-signin');
        GoogleSigninModule = mod.GoogleSignin;
        googleSigninStatusCodes = mod.statusCodes;
        isGoogleSigninAvailable = true;

        // Configure ngay sau khi load thành công
        GoogleSigninModule.configure({
            webClientId: WEB_CLIENT_ID,
            offlineAccess: true,
        });

        return GoogleSigninModule;
    } catch (e) {
        console.warn(
            '[GoogleSignin] Native module không khả dụng (Expo Go). ' +
            'Google Sign-In trên native sẽ không hoạt động. ' +
            'Hãy dùng development build để sử dụng tính năng này.'
        );
        isGoogleSigninAvailable = false;
        return null;
    }
}

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAmx75i6eNN4cobRsi2Kdd1nk4MA6aWKxw",
    authDomain: "chat-ai-cbec9.firebaseapp.com",
    databaseURL: "https://chat-ai-cbec9-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "chat-ai-cbec9",
    storageBucket: "chat-ai-cbec9.firebasestorage.app",
    messagingSenderId: "574556188055",
    appId: "1:574556188055:web:cbc2eca27935e6eb0428d2",
    measurementId: "G-4SB7F8MGBS"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const database = getDatabase(app);

// Web Client ID từ google-services.json
const WEB_CLIENT_ID = '574556188055-ls72t2ta63vilqbmmdq0f4ap80lhdgis.apps.googleusercontent.com';

/**
 * Đăng nhập bằng Google
 */
export const signInWithGoogle = async (): Promise<User> => {
    try {
        if (Platform.OS === 'web') {
            const provider = new GoogleAuthProvider();
            const result = await import('firebase/auth').then(({ signInWithPopup }) =>
                signInWithPopup(auth, provider)
            );
            return result.user;
        } else {
            const gSignin = getGoogleSignin();
            if (!gSignin) {
                throw new Error(
                    'Google Sign-In không khả dụng trên Expo Go. ' +
                    'Vui lòng sử dụng development build (npx expo run:android).'
                );
            }

            // Check if device supports Google Play Services
            await gSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Sign in with Google
            const signInResult = await gSignin.signIn();

            // Get ID token
            const idToken = signInResult.data?.idToken;
            if (!idToken) {
                throw new Error('Không thể lấy ID token từ Google');
            }

            // Create Firebase credential
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // Sign in to Firebase
            const userCredential = await signInWithCredential(auth, googleCredential);
            console.log('Google Sign-In successful:', userCredential.user.email);

            return userCredential.user;
        }
    } catch (error: any) {
        console.error('Google Sign-In error:', error);

        if (Platform.OS !== 'web' && googleSigninStatusCodes) {
            if (error.code === googleSigninStatusCodes.SIGN_IN_CANCELLED) {
                throw new Error('Đăng nhập đã bị hủy');
            } else if (error.code === googleSigninStatusCodes.IN_PROGRESS) {
                throw new Error('Đang đăng nhập...');
            } else if (error.code === googleSigninStatusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                throw new Error('Google Play Services không khả dụng');
            }
        }

        throw new Error(error.message || 'Đăng nhập thất bại');
    }
};

/**
 * Đăng xuất
 */
export const signOutUser = async (): Promise<void> => {
    try {
        if (Platform.OS !== 'web') {
            const gSignin = getGoogleSignin();
            if (gSignin) {
                await gSignin.signOut();
            }
        }
        await signOut(auth);
        console.log('Signed out successfully');
    } catch (error) {
        console.error('Sign out error:', error);
    }
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

/**
 * Thử tự động đăng nhập nếu đã đăng nhập trước đó
 */
export const tryAutoSignIn = async (): Promise<User | null> => {
    if (Platform.OS === 'web') {
        // Web Auto Sign-in is handled by onAuthStateChanged listener automatically
        return null;
    }

    try {
        const gSignin = getGoogleSignin();
        if (!gSignin) {
            // Expo Go — không có Google Sign-In native
            return null;
        }

        // Kiểm tra xem đã có user đăng nhập trong Google không
        const currentGoogleUser = await gSignin.getCurrentUser();

        if (currentGoogleUser && currentGoogleUser.idToken) {
            // Đăng nhập lại vào Firebase
            const googleCredential = GoogleAuthProvider.credential(currentGoogleUser.idToken);
            const userCredential = await signInWithCredential(auth, googleCredential);
            console.log('Auto sign-in successful:', userCredential.user.email);
            return userCredential.user;
        }

        return null;
    } catch (error) {
        console.log('Auto sign-in failed, user needs to sign in manually:', error);
        return null;
    }
};

export { app, auth, database };
export type { User };
