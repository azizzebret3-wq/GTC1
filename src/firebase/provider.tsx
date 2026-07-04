'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

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
  xp?: number;
  level?: number;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    reloadUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Formule de progression de Prestige (Rare)
 * Le passage au niveau supérieur est exponentiellement plus difficile.
 */
export const getXpRangeForLevel = (level: number) => {
    if (level <= 1) return { minXp: 0, maxXp: 2500, requiredForNext: 2500 };
    if (level === 2) return { minXp: 2500, maxXp: 10000, requiredForNext: 7500 };
    if (level === 3) return { minXp: 10000, maxXp: 25000, requiredForNext: 15000 };
    if (level === 4) return { minXp: 25000, maxXp: 55000, requiredForNext: 30000 };
    return { minXp: 55000, maxXp: 100000, requiredForNext: 45000 }; // Plafond prestige
};

export const calculateLevelFromXp = (xp: number): number => {
    if (xp < 2500) return 1;
    if (xp < 10000) return 2;
    if (xp < 25000) return 3;
    if (xp < 55000) return 4;
    return 5; // Niveau Max (Légende)
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (currentUser: User): Promise<UserData | null> => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc: DocumentSnapshot = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // --- VÉRIFICATION AUTOMATIQUE DE L'EXPIRATION PREMIUM ---
        let currentSubType = data.subscription_type || 'gratuit';
        let currentSubTier = data.subscription_tier || null;
        let currentSubExpiry = data.subscription_expires_at;

        if (currentSubType === 'premium' && currentSubExpiry) {
          const expiryDate = currentSubExpiry instanceof Timestamp ? currentSubExpiry.toDate() : new Date(currentSubExpiry);
          const now = new Date();
          
          if (now > expiryDate) {
            // L'abonnement a expiré ! On désactive sans intervention admin.
            await updateDoc(userDocRef, {
              subscription_type: 'gratuit',
              subscription_tier: null,
              subscription_expires_at: null
            });
            currentSubType = 'gratuit';
            currentSubTier = null;
            currentSubExpiry = null;
          }
        }

        // --- Recalcul du niveau de prestige ---
        const currentXp = data.xp || 0;
        const correctLevel = calculateLevelFromXp(currentXp);
        if (data.level !== correctLevel) {
            await updateDoc(userDocRef, { level: correctLevel });
        }

        return {
          uid: currentUser.uid,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          competitionType: data.competitionType,
          photoURL: currentUser.photoURL || undefined,
          role: data.role,
          subscription_type: currentSubType,
          subscription_tier: currentSubTier,
          subscription_expires_at: currentSubExpiry,
          createdAt: data.createdAt,
          xp: currentXp,
          level: correctLevel,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const data = await fetchUserData(currentUser);
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
      const data = await fetchUserData(user);
      setUserData(data);
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
