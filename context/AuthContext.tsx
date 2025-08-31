import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    signInUser as apiSignIn, 
    signUpUser as apiSignUp, 
    signOutUser as apiSignOut,
    signInWithGoogle as apiSignInWithGoogle,
    onAuthUserStateChanged
} from '../services/authService';
import type { UserData, UserRole } from '../types';

interface AuthContextType {
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, displayName?: string, schoolId?: string, county?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithWallet: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true); // Start loading until session is checked

  useEffect(() => {
    const unsubscribe = onAuthUserStateChanged((user) => {
      setUserData(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await apiSignIn(email, password);
    if (error) throw error;
    // onAuthStateChange will handle setting the user data
  };
  
  const signUp = async (email: string, password: string, role: UserRole, displayName?: string, schoolId?: string, county?: string) => {
    const { error } = await apiSignUp(email, password, role, displayName, schoolId, county);
    if (error) throw error;
    // For email confirmation flows, the user won't be logged in immediately.
    // onAuthStateChange will correctly handle the user state.
  };

  const signInWithGoogle = async () => {
    const { error } = await apiSignInWithGoogle();
    if (error) throw error;
  };
  
  const signInWithWallet = async (walletAddress: string) => {
    // This is a mock sign-in for demonstration purposes.
    // A full implementation would involve a "Sign in with Ethereum" (SIWE) flow.
    setLoading(true);
    const mockUserData: UserData = {
      uid: walletAddress,
      email: `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
      role: 'STUDENT', // Default to student for wallet users
      displayName: 'Wallet User'
    };
    setUserData(mockUserData);
    setLoading(false);
  };


  const signOut = async () => {
    // Check if user is a wallet user (mock user)
    if (userData && userData.uid.startsWith('0x')) {
      setUserData(null);
      return;
    }
    const { error } = await apiSignOut();
    if (error) {
        console.error("Sign out error:", error);
    }
    // Set user to null immediately for faster UI feedback
    setUserData(null);
  };

  const value = {
    userData,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithWallet
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
