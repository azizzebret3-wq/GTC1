// src/app/dashboard/documents/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { 
  BookOpen, 
  Search, 
  ArrowRight,
  Crown,
  Lock,
  FileText,
  Video,
  Loader,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { LibraryDocument, getDocumentsFromFirestore } from '@/lib/firestore.service';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DocumentsPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
  });

   useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const fetchedDocs = await getDocumentsFromFirestore();
        setDocuments(fetchedDocs);
      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les documents de la bibliothèque.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [toast]);

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const filteredDocuments = documents.filter(doc => {
    return (
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.category === 'all' || doc.category === filters.category) &&
      (filters.type === 'all' || doc.type === filters.type)
    );
  });
  
  const isPremium = userData?.subscription_type === 'premium';
  const isAdmin = userData?.role === 'admin';
  
  const categories = ['all', ...Array.from(new Set(documents.map(d => d.category)))];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Bibliothèque
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Toutes les ressources pour votre succès.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="glassmorphism shadow-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une ressource..."
              className="pl-9 h-10 rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="h-10 rounded-lg text-sm">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat} value={cat} className="text-sm">{cat === 'all' ? 'Toutes les catégories' : cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
         <Tabs defaultValue="all" onValueChange={(value) => handleFilterChange('type', value)}>
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="pdf">PDFs</TabsTrigger>
                <TabsTrigger value="video">Vidéos</TabsTrigger>
            </TabsList>
        </Tabs>
      </Card>
      
      {isLoading ? (
         <div className="flex justify-center items-center h-64">
            <Loader className="w-10 h-10 animate-spin text-purple-500"/>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map(doc => {
              const Icon = doc.type === 'pdf' ? FileText : Video;
              const canAccess = isAdmin || doc.access_type === 'gratuit' || isPremium;
              
              return (
                <Card key={doc.id} className="card-hover glassmorphism shadow-xl group overflow-hidden border-0 flex flex-col">
                  <CardContent className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                        doc.type === 'pdf' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                        'bg-gradient-to-r from-blue-500 to-cyan-500'
                       }`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {doc.access_type === 'premium' && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                      {doc.title}
                    </h3>
                    <Badge variant="outline" className="text-xs font-semibold capitalize">
                      {doc.category}
                    </Badge>
                  </CardContent>
                  <Button 
                      className={`w-full font-bold text-white rounded-t-none h-12 text-sm ${
                        !canAccess
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                      }`}
                      onClick={(e) => {
                         e.preventDefault();
                         if (canAccess) {
                            window.open(doc.url, '_blank');
                         } else {
                            router.push('/dashboard/premium');
                         }
                      }}
                    >
                      {!canAccess ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Premium
                        </>
                      ) : (
                        <>
                          {doc.type === 'pdf' ? 'Consulter' : 'Visionner'}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                  </Button>
                </Card>
              );
            })}
          </div>
          {filteredDocuments.length === 0 && (
            <div className="text-center py-10 col-span-full">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucune ressource trouvée</h3>
                <p className="text-gray-500 text-sm">Essayez de modifier vos filtres ou revenez plus tard.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
