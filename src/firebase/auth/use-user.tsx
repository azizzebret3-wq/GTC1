'use client';

/**
 * @fileOverview Hook utilitaire pour accéder aux données de l'utilisateur.
 * Ce fichier utilise le fournisseur d'authentification centralisé de l'application.
 */

import { useAuth } from '@/firebase/provider';

export function useUser() {
  const { user, userData, loading } = useAuth();
  return { user, userData, loading };
}
