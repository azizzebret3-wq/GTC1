'use client';

/**
 * @fileOverview Hook utilitaire pour accéder aux données utilisateur.
 */

import { useAuth } from '../provider';

export function useUser() {
  const { user, userData, loading } = useAuth();
  return { user, userData, loading };
}
