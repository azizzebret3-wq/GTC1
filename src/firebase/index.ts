'use client';

/**
 * @fileOverview Point d'entrée principal pour Firebase dans l'application.
 * Fournit un accès simplifié aux instances configurées.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

auth = getAuth(firebaseApp);
firestore = getFirestore(firebaseApp);

// Activation de la persistance hors ligne
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence unimplemented: Browser not supported');
    }
  });
}

export { firebaseApp, auth, firestore };
export * from './provider';
export { useUser } from './auth/use-user';
