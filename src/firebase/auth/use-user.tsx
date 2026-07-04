'use client';

/**
 * @fileOverview Hook utilitaire pour accéder aux données de l'utilisateur.
 * Ce fichier redirige vers useAuth pour maintenir une source de vérité unique.
 */

import { useAuth } from '@/hooks/useAuth';

export function useUser() {
  const { user, userData, loading } = useAuth();
  return { user, userData, loading };
}
