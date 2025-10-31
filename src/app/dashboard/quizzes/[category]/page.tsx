// src/app/dashboard/quizzes/[category]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth.tsx';
import { 
  Search, 
  Crown,
  Lock,
  Rocket,
  Loader,
  ClipboardList,
  ArrowLeft
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
import { getAllLocalQuizzes } from '@/lib/localdb.service';
import * as LucideIcons from "lucide-react";


const categoryVisuals: { [key: string]: { icon: keyof typeof LucideIcons; gradient: string } } = {
  'Mathématiques': { icon: 'Calculator', gradient: 'from-blue-500 to-cyan-500' },
  'SVT': { icon: 'TestTube2', gradient: 'from-green-500 to-emerald-500' },
  'Français': { icon: 'Languages', gradient: 'from-orange-500 to-amber-500' },
  'Culture Générale': { icon: 'Globe', gradient: 'from-indigo-500 to-purple-600' },
  'Histoire-Géographie': { icon: 'Book', gradient: 'from-rose-500 to-pink-500' },
  'default': { icon: 'Book', gradient: 'from-gray-500 to-gray-600' }
};

const Icon = ({ name, ...props }: { name: keyof typeof LucideIcons } & LucideIcons.LucideProps) => {
  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideIcons.LucideProps>;
  if (!LucideIcon) return <LucideIcons.Book {...props} />; // Fallback icon
  return <LucideIcon {...props} />;
};


export default function QuizListPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const category = decodeURIComponent(params.category as string);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    access: 'all',
  });
  const [isOffline, setIsOffline] = useState(false);

  const isPremium = userData?.subscription_type === 'premium';
  const isAdmin = userData?.role === 'admin';
  const canAccessPremium = isPremium || isAdmin;

  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    handleOnlineStatus();
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoadingQuizzes(true);
      try {
        let allQuizzes: Quiz[] = [];
        if (isOffline) {
          allQuizzes = await getAllLocalQuizzes();
        } else {
          allQuizzes = await getQuizzesFromFirestore();
        }
        
        const categoryQuizzes = allQuizzes.filter(q => !q.isMockExam && q.category === category);
        setQuizzes(categoryQuizzes);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur de chargement',
          description: 'Impossible de récupérer les quiz.',
        });
      } finally {
        setIsLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, [toast, isOffline, category]);

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    return (
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.difficulty === 'all' || quiz.difficulty === filters.difficulty) &&
      (filters.access === 'all' || quiz.access_type === filters.access)
    );
  });
  
  const difficulties = ['all', 'facile', 'moyen', 'difficile'];
  const accessTypes = ['all', 'gratuit', 'premium'];
  const visuals = categoryVisuals[category] || categoryVisuals.default;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => router.push('/dashboard/quizzes')}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className={`w-12 h-12 bg-gradient-to-r ${visuals.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon name={visuals.icon} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                {category}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                {quizzes.length} quiz disponibles dans cette catégorie.
              </p>
            </div>
          </div>
        </div>
         <Button variant="outline" onClick={() => router.push('/dashboard/quizzes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Toutes les catégories
        </Button>
      </div>

      <Card className="glassmorphism shadow-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative sm:col-span-3 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un quiz..."
              className="pl-9 h-10 rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
              const isLocked = quiz.access_type === 'premium' && !canAccessPremium && !isOffline;
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
                <p className="text-gray-500 text-sm">Essayez de modifier vos filtres ou revenez plus tard.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
