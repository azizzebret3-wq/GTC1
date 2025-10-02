// src/app/dashboard/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, UserCircle, Edit, Save, Camera, Loader, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, updateProfile } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user, userData, loading, reloadUserData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || '');
      setPhone(userData.phone || '');
    }
  }, [userData]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        fullName,
        phone,
      });

      const auth = getAuth();
      if(auth.currentUser){
         await updateProfile(auth.currentUser, {
            displayName: fullName,
         });
      }
      
      // Important: we call reloadUserData() which is part of our useAuth hook
      // to refresh the user data everywhere in the app.
      await reloadUserData();

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  if (loading || !userData) {
    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 flex justify-center items-center h-[70vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader className="w-12 h-12 animate-spin text-purple-500" />
                <p className="font-medium text-muted-foreground">Chargement du profil...</p>
            </div>
        </div>
    )
  }

  const isPremium = userData?.subscription_type === 'premium';

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Mon Profil
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Gérez vos informations.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Card className="glassmorphism shadow-xl max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <Avatar className="w-20 h-20 ring-4 ring-white/50 shadow-lg">
                <AvatarImage src={userData?.photoURL ?? undefined} />
                <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-2xl">
                   {getInitials(userData?.fullName)}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-7 w-7 bg-gradient-to-r from-indigo-500 to-purple-600 text-white group-hover:scale-110 transition-transform">
                <Camera className="h-4 w-4" />
                <span className="sr-only">Changer la photo</span>
              </Button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <CardTitle className="text-2xl font-bold">{userData?.fullName}</CardTitle>
              <CardDescription className="text-gray-600 font-medium">{userData?.phone}</CardDescription>
               {isPremium && (
                  <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold shadow-lg px-3 py-1 text-xs">
                    <Crown className="w-3 h-3 mr-1.5" />
                    Membre Premium
                  </Badge>
                )}
            </div>
             <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} className="shrink-0">
                {isEditing ? <Save className="w-5 h-5 text-gray-600" /> : <Edit className="w-5 h-5 text-gray-600" />}
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <Label htmlFor="fullName" className="font-semibold text-gray-700">Nom & Prénom(s)</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!isEditing || isSaving} className="h-11 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="font-semibold text-gray-700">Téléphone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing || isSaving} className="h-11 rounded-lg" />
              </div>
            </div>
             <div className="space-y-1.5">
              <Label htmlFor="competitionType" className="font-semibold text-gray-700">Type de Concours</Label>
              <Input id="competitionType" value={userData?.competitionType || ''} disabled className="h-11 rounded-lg bg-gray-100 dark:bg-gray-800 capitalize" />
            </div>
            {isEditing && (
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="rounded-lg h-11" disabled={isSaving}>Annuler</Button>
                <Button type="submit" className="rounded-lg h-11 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg" disabled={isSaving}>
                  {isSaving ? <><Loader className="mr-2 h-4 w-4 animate-spin"/>Enregistrement...</> : <><Save className="h-4 w-4 mr-2"/>Enregistrer</>}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
