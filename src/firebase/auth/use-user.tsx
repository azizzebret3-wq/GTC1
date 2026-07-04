'use client';

/**
 * @fileOverview Hook utilitaire pour accéder aux données de l'utilisateur.
 * Utilise la source de vérité unique définie dans @/firebase/provider.
 */

import { useAuth } from '@/firebase/provider';

export function useUser() {
  const { user, userData, loading } = useAuth();
  return { user, userData, loading };
}
