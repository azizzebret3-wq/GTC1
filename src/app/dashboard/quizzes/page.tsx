// src/app/dashboard/quizzes/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth.tsx';
import { 
  ClipboardList, 
  Search, 
  ArrowRight,
  Crown,
  Lock,
  Rocket,
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
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { getQuizzesFromFirestore, Quiz } from '@/lib/firestore.service';

export default function QuizzesPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    access: 'all',
  });
  
  const isPremium = userData?.subscription_type === 'premium';
  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoadingQuizzes(true);
      try {
        const allQuizzes = await getQuizzesFromFirestore();
        // Exclude mock exams from the general quiz list
        const regularQuizzes = allQuizzes.filter(q => !q.isMockExam);
        setQuizzes(regularQuizzes);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur de chargement',
          description: 'Impossible de récupérer les quiz depuis la base de données.',
        });
      } finally {
        setIsLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, [toast]);

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    return (
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.category === 'all' || quiz.category === filters.category) &&
      (filters.difficulty === 'all' || quiz.difficulty === filters.difficulty) &&
      (filters.access === 'all' || quiz.access_type === filters.access)
    );
  });
  
  const categories = ['all', ...Array.from(new Set(quizzes.map(q => q.category)))];
  const difficulties = ['all', 'facile', 'moyen', 'difficile'];
  const accessTypes = ['all', 'gratuit', 'premium'];


  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Tous les Quiz
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Mettez-vous au défi avec notre sélection de quiz.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="glassmorphism shadow-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
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
          <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
            <SelectTrigger className="h-10 rounded-lg text-sm">
              <SelectValue placeholder="Difficulté" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(diff => <SelectItem key={diff} value={diff} className="text-sm">{diff === 'all' ? 'Toutes les difficultés' : diff.charAt(0).toUpperCase() + diff.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
           <Select value={filters.access} onValueChange={(value) => handleFilterChange('access', value)}>
            <SelectTrigger className="h-10 rounded-lg text-sm">
              <SelectValue placeholder="Accès" />
            </SelectTrigger>
            <SelectContent>
               {accessTypes.map(acc => <SelectItem key={acc} value={acc} className="text-sm">{acc === 'all' ? 'Tous les accès' : acc.charAt(0).toUpperCase() + acc.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isLoadingQuizzes ? (
        <div className="flex justify-center items-center h-64">
            <Loader className="w-10 h-10 animate-spin text-purple-500"/>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredQuizzes.map((quiz) => {
              const isLocked = quiz.access_type === 'premium' && !isPremium && !isAdmin;
              return (
                <Card key={quiz.id} className="card-hover glassmorphism shadow-xl group overflow-hidden border-0 flex flex-col">
                  <CardContent className="p-5 flex-grow">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className={`text-xs font-semibold capitalize ${
                        quiz.difficulty === 'facile' ? 'border-green-300 text-green-700' :
                        quiz.difficulty === 'moyen' ? 'border-yellow-300 text-yellow-700' :
                        'border-red-300 text-red-700'
                      }`}>
                        {quiz.difficulty}
                      </Badge>
                      {quiz.access_type === 'premium' && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mt-3 mb-2 group-hover:text-purple-600 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mb-3">
                      {quiz.category}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-600 font-medium border-t border-gray-200 pt-3">
                      <span>{quiz.total_questions} questions</span>
                      <span>{quiz.duration_minutes} min</span>
                    </div>
                  </CardContent>
                  <Button 
                    className={`w-full font-bold text-white rounded-t-none h-12 text-sm ${
                      isLocked 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (isLocked) {
                        router.push('/dashboard/premium');
                      } else {
                        router.push(`/dashboard/take-quiz?id=${quiz.id}`);
                      }
                    }}
                  >
                      {isLocked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Premium
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                          Commencer
                        </>
                      )}
                  </Button>
                </Card>
              );
            })}
          </div>
          {filteredQuizzes.length === 0 && (
            <div className="text-center py-10 col-span-full">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucun quiz trouvé</h3>
                <p className="text-gray-500 text-sm">Essayez de modifier vos filtres.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
