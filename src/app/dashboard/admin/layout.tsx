// src/app/dashboard/admin/layout.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and user is not an admin, redirect them away.
    if (!loading && userData?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  // While loading, or if the user is not an admin yet (and is being redirected),
  // show a loading spinner. This prevents a flash of admin content.
  if (loading || userData?.role !== 'admin') {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 flex justify-center items-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
            <Loader className="w-12 h-12 animate-spin text-purple-500" />
            <p className="font-medium text-muted-foreground">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }
  
  // If the user is an admin, render the children (the specific admin page).
  return <>{children}</>;
}
