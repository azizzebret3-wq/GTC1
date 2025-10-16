// src/hooks/useAuth.tsx
'use client';

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserData {
  uid: string;
  fullName?: string;
  email?: string;
  phone?: string;
  competitionType?: string;
  photoURL?: string;
  role?: 'admin' | 'user';
  subscription_type?: 'premium' | 'gratuit';
  subscription_tier?: 'mensuel' | 'annuel';
  subscription_expires_at?: Date | Timestamp | null;
  createdAt: any;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    reloadUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (user: User): Promise<UserData | null> => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc: DocumentSnapshot = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        const fetchedData: UserData = {
          uid: user.uid,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          competitionType: data.competitionType,
          photoURL: user.photoURL,
          role: data.role,
          subscription_type: data.subscription_type,
          subscription_tier: data.subscription_tier,
          subscription_expires_at: data.subscription_expires_at,
          createdAt: data.createdAt,
        };

        // Check for subscription expiry only if online
        const isOnline = typeof window !== 'undefined' && window.navigator.onLine;
        if (isOnline && fetchedData.subscription_type === 'premium' && fetchedData.subscription_expires_at) {
          const expiryDate = (fetchedData.subscription_expires_at as Timestamp).toDate();
          if (new Date() > expiryDate) {
            // Subscription has expired, revert to 'gratuit'
            await updateDoc(userDocRef, {
              subscription_type: 'gratuit',
              subscription_tier: null,
              subscription_expires_at: null
            });
            // Update local data to reflect the change
            fetchedData.subscription_type = 'gratuit';
            fetchedData.subscription_tier = undefined;
            fetchedData.subscription_expires_at = null;
          }
        }
        
        return fetchedData;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const data = await fetchUserData(user);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const reloadUserData = useCallback(async () => {
    if (user) {
      setLoading(true);
      const data = await fetchUserData(user);
      setUserData(data);
      setLoading(false);
    }
  }, [user, fetchUserData]);
  
  const value = { user, userData, loading, reloadUserData };

  return (
    <AuthContext.Provider value={value}>
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
