import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    is_provider?: boolean;
    is_admin?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@levi:token';
const USER_KEY = '@levi:user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem(TOKEN_KEY),
                AsyncStorage.getItem(USER_KEY),
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                auth.setToken(storedToken);
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await auth.login(email, password);
            setToken(response.token);
            setUser(response.user);
            
            await Promise.all([
                AsyncStorage.setItem(TOKEN_KEY, response.token),
                AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
            ]);
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData: any) => {
        try {
            const response = await auth.register(userData);
            setToken(response.token);
            setUser(response.user);
            
            await Promise.all([
                AsyncStorage.setItem(TOKEN_KEY, response.token),
                AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
            ]);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await auth.logout();
            setToken(null);
            setUser(null);
            
            await Promise.all([
                AsyncStorage.removeItem(TOKEN_KEY),
                AsyncStorage.removeItem(USER_KEY),
            ]);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!token && !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

