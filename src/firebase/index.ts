'use client';

/**
 * @fileOverview Point d'entrée principal pour Firebase dans l'application.
 * Gère l'initialisation et l'exportation des services essentiels.
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
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);

  if (typeof window !== 'undefined') {
    enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence unimplemented');
      }
    });
  }
} else {
  firebaseApp = getApp();
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
}

export { firebaseApp, auth, firestore };
export * from './provider';
export * from './auth/use-user';
