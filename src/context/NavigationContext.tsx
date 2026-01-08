import React from 'react';

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
    logout: () => void;
}

export const NavigationContext = React.createContext<NavigationContextType>({
    navigate: () => { },
    goBack: () => { },
    user: null,
    login: async () => false,
    logout: () => { },
});
