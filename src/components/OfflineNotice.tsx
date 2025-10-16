'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set initial state
    if (typeof window !== 'undefined') {
      setIsOffline(!window.navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: 'Mode hors ligne activé',
        description: 'Vous naviguez maintenant hors connexion.',
      });
    };

    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: 'Vous êtes de retour en ligne',
        description: 'La connexion a été rétablie.',
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [toast]);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[101] bg-yellow-500 text-black p-3 text-center text-sm font-semibold flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span>Mode hors ligne activé — seules les données en cache sont disponibles.</span>
    </div>
  );
}
