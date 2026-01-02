import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { auth, googleProvider } from '../lib/firebase';
import { api } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    session: any | null; // Keeping session for compatibility
    loading: boolean;
    isAdmin: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false); // Can logic this later based on email

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Determine Admin Status (e.g. whitelist or backend check)
                setIsAdmin(true);

                // OPTIONAL: Sync user to backend
                try {
                    const token = await currentUser.getIdToken();
                    // Auto-Synced enabled for Role-Based Auth
                    await api.post('/api/auth/sync', {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        photoURL: currentUser.photoURL
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (err) {
                    console.error("Backend Sync Failed", err);
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google Sign In Error", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Logout Error", error);
        }
    };

    // Derived session object for compatibility with code expecting Supabase-like structure
    const session = user ? {
        access_token: "firebase-token-placeholder",
        user: {
            id: user.uid,
            email: user.email,
            user_metadata: {
                full_name: user.displayName,
                avatar_url: user.photoURL
            }
        }
    } : null;

    return (
        <AuthContext.Provider value={{ user, session, loading, isAdmin, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
