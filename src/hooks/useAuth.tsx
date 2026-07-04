'use client';

/**
 * @fileOverview Hook d'authentification simplifié.
 * Ce fichier ré-exporte le hook centralisé depuis @/firebase/provider pour assurer
 * la compatibilité avec les composants existants sans dupliquer la logique.
 */

export { useAuth, AuthProvider, type UserData } from '@/firebase/provider';
