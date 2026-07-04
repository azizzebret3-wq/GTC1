'use client';

/**
 * @fileOverview Initialisation Firebase côté client.
 */

import React, { useMemo } from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { AuthProvider } from './provider';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useMemo(() => {
    if (getApps().length === 0) {
      const app = initializeApp(firebaseConfig);
      getAuth(app);
      getFirestore(app);
    }
  }, []);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
