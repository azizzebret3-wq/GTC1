// src/app/dashboard/admin/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader, Shield, UserCheck, MoreHorizontal, Check, ChevronsUpDown, ArrowLeft, Crown, Search } from "lucide-react";
import { AppUser, getUsersFromFirestore, updateUserRoleInFirestore, updateUserSubscriptionInFirestore } from '@/lib/firestore.service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';


type SubscriptionValue = "gratuit" | "premium_mensuel" | "premium_annuel";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'user' | ''>('');
  const [newSubscription, setNewSubscription] = useState<SubscriptionValue>('gratuit');
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsersFromFirestore();
      setUsers(fetchedUsers);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description: 'Impossible de récupérer les utilisateurs.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user: AppUser) => {
    setSelectedUser(user);
    setNewRole(user.role || 'user');
    
    let currentSub: SubscriptionValue = 'gratuit';
    if(user.subscription_type === 'premium') {
        currentSub = user.subscription_tier === 'annuel' ? 'premium_annuel' : 'premium_mensuel';
    }
    setNewSubscription(currentSub);
    setIsDialogOpen(true);
  }

  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    
    try {
      let roleUpdated = false;
      let subscriptionUpdated = false;

      // Update role if changed
      if (newRole && newRole !== selectedUser.role) {
        await updateUserRoleInFirestore(selectedUser.uid, newRole as 'admin' | 'user');
        roleUpdated = true;
      }
      
      // Determine current subscription state
      let currentSub: SubscriptionValue = 'gratuit';
      if(selectedUser.subscription_type === 'premium') {
          currentSub = selectedUser.subscription_tier === 'annuel' ? 'premium_annuel' : 'premium_mensuel';
      }

      // Update subscription if changed
      if (newSubscription !== currentSub) {
        const subType = newSubscription.startsWith('premium') ? 'premium' : 'gratuit';
        const subTier = newSubscription === 'premium_mensuel' ? 'mensuel' : (newSubscription === 'premium_annuel' ? 'annuel' : null);
        await updateUserSubscriptionInFirestore(selectedUser.uid, { type: subType, tier: subTier });
        subscriptionUpdated = true;
      }
      
      if(roleUpdated || subscriptionUpdated){
        toast({
          title: 'Modifications enregistrées',
          description: `Les informations de ${selectedUser.fullName} ont été mises à jour.`,
        });
        await fetchUsers(); // Refresh user list
      } else {
         toast({
          title: 'Aucun changement',
          description: `Aucune modification n'a été détectée.`,
        });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erreur de mise à jour',
        description: 'Les informations de l\'utilisateur n\'ont pas pu être modifiées.',
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  const getSubscriptionLabel = (user: AppUser) => {
    if (user.subscription_type === 'premium') {
        const tier = user.subscription_tier === 'annuel' ? 'Annuel' : 'Mensuel';
        return `Premium (${tier})`;
    }
    return 'Gratuit';
  }

  const filteredUsers = users.filter(user => 
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Gérer les Utilisateurs
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Consultez la liste des utilisateurs et gérez leurs permissions.
              </p>
            </div>
          </div>
        </div>
         <Button variant="outline" onClick={() => router.push('/dashboard/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'admin
        </Button>
      </div>

       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par numéro de téléphone..."
            className="pl-9 h-10 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      
      <Card className="glassmorphism shadow-xl">
        <CardHeader>
          <CardTitle>Liste des utilisateurs inscrits</CardTitle>
          <CardDescription>
            Actuellement, {filteredUsers.length} sur {users.length} utilisateurs affichés.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="w-10 h-10 animate-spin text-purple-500"/>
              </div>
           ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead className="hidden md:table-cell">Expire le</TableHead>
                  <TableHead className="hidden md:table-cell">Inscrit le</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.fullName || 'N/A'}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role === 'admin' ? <Shield className="mr-1 h-3 w-3"/> : <UserCheck className="mr-1 h-3 w-3"/>}
                        {user.role}
                      </Badge>
                    </TableCell>
                     <TableCell>
                      <Badge variant={user.subscription_type === 'premium' ? 'default' : 'outline'} className={user.subscription_type === 'premium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0' : ''}>
                        {user.subscription_type === 'premium' && <Crown className="mr-1 h-3 w-3"/>}
                        {getSubscriptionLabel(user)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {user.subscription_expires_at ? format(new Date(user.subscription_expires_at as any), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(user.createdAt as any), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleOpenDialog(user)}>
                            Modifier
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier {selectedUser?.fullName}</DialogTitle>
            <DialogDescription>
              Changez le rôle ou le type d'abonnement de cet utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-select">Rôle</Label>
               <Select value={newRole} onValueChange={(value) => setNewRole(value as 'admin' | 'user')}>
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="subscription-select">Abonnement</Label>
               <Select value={newSubscription} onValueChange={(value) => setNewSubscription(value as SubscriptionValue)}>
                  <SelectTrigger id="subscription-select">
                    <SelectValue placeholder="Sélectionner un abonnement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gratuit">Gratuit</SelectItem>
                    <SelectItem value="premium_mensuel">Premium (Mensuel)</SelectItem>
                    <SelectItem value="premium_annuel">Premium (Annuel)</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Annuler</Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
