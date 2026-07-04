'use client';

/**
 * @fileOverview Point d'entrée principal pour Firebase dans l'application.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const firebaseApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  if (typeof window !== 'undefined') {
    enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed-precondition: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence unimplemented: browser not supported');
      }
    });
  }

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
