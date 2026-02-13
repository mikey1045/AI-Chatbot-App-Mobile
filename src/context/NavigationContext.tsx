import React from 'react';
import { User as FirebaseUser } from '../config/firebaseConfig';

export interface User {
    id: string;
    name: string;
    email: string;
}

export type ScreenName = 'loading' | 'login' | 'chat' | 'history' | 'settings';

export interface NavigationContextType {
    navigate: (screen: ScreenName) => void;
    goBack: () => void;
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithFirebaseUser: (firebaseUser: FirebaseUser) => void;
    logout: () => void;
}

export const NavigationContext = React.createContext<NavigationContextType>({
    navigate: () => { },
    goBack: () => { },
    user: null,
    login: async () => false,
    loginWithFirebaseUser: () => { },
    logout: () => { },
});
