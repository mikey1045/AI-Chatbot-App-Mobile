import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextData {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate checking for stored token
        const loadStorageData = async () => {
            setTimeout(() => {
                setIsLoading(false);
            }, 1500);
        };

        loadStorageData();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        // Simulate API call
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    setUser({
                        id: '1',
                        name: 'Sinh viên',
                        email: email,
                    });
                    setIsLoading(false);
                    resolve();
                } else {
                    setIsLoading(false);
                    reject(new Error('Email hoặc mật khẩu không đúng'));
                }
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
