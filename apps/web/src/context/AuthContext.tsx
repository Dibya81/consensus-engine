'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setToken(localStorage.getItem('consensus_token'));
        }
    }, []);

    useEffect(() => {
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth) {
            alert("Firebase is not initialized. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env.local file.");
            return;
        }
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const fbUser = result.user;
            const token = await fbUser.getIdToken();

            // Login to backend to get JWT
            const response = await fetch('http://localhost:8000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Backend authentication failed");

            const data = await response.json();
            localStorage.setItem('consensus_token', data.access_token);
            setToken(data.access_token);
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Error signing in with Google:", error);
            alert(`Failed to sign in: ${error?.message || error}. \n\nCheck your Firebase Console: ensure 'Google' Sign-In Provider is enabled, and 'localhost' is listed in authorized domains.`);
        }
    };

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('consensus_token');
        setToken(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, signInWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
