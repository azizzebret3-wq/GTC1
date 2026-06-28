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
  ArrowLeft,
  WifiOff,
  CheckCircle2,
  Download,
  DownloadCloud
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
import { getAllLocalQuizzes, saveQuizLocally } from '@/lib/localdb.service';
import * as LucideIcons from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
  const [offlineQuizIds, setOfflineQuizIds] = useState<Set<string>>(new Set());
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    access: 'all',
  });
  const [isOffline, setIsOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

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

  const refreshQuizList = async () => {
    setIsLoadingQuizzes(true);
    try {
      const localQuizzes = await getAllLocalQuizzes();
      const localIds = new Set(localQuizzes.map(q => q.id));
      setOfflineQuizIds(localIds);

      let allQuizzes: Quiz[] = [];
      if (!navigator.onLine) {
        allQuizzes = localQuizzes;
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

  useEffect(() => {
    refreshQuizList();
  }, [category, isOffline]);

  const handleDownloadQuiz = async (quiz: Quiz) => {
    if (!navigator.onLine) {
        toast({ title: 'Hors ligne', description: 'Connectez-vous pour télécharger.', variant: 'destructive' });
        return;
    }
    setIsDownloading(quiz.id!);
    try {
        await saveQuizLocally(quiz);
        setOfflineQuizIds(prev => new Set(prev).add(quiz.id!));
        toast({ title: 'Téléchargé !', description: 'Ce quiz est prêt pour le mode hors ligne.' });
    } catch (e) {
        toast({ title: 'Erreur', description: 'Le téléchargement a échoué.', variant: 'destructive' });
    } finally {
        setIsDownloading(null);
    }
  };

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
  const canAccessPremium = userData?.subscription_type === 'premium' || userData?.role === 'admin';

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
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                {quizzes.length} quiz disponibles {isOffline && 'en cache'}.
              </p>
            </div>
          </div>
        </div>
         <Button variant="outline" onClick={() => router.push('/dashboard/quizzes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Toutes les catégories
        </Button>
      </div>

      {isOffline && (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900 p-4 rounded-2xl flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-yellow-600" />
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
            Mode hors ligne : Seuls les quiz téléchargés sont accessibles.
          </p>
        </Card>
      )}

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
              const isCached = offlineQuizIds.has(quiz.id!);
              const isLocked = quiz.access_type === 'premium' && !canAccessPremium && !isOffline;
              
              return (
                <Card key={quiz.id} className={`card-hover glassmorphism shadow-xl group overflow-hidden border-0 flex flex-col ${isOffline && !isCached ? 'opacity-60 grayscale' : ''}`}>
                  <CardContent className="p-5 flex-grow">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase ${
                            quiz.difficulty === 'facile' ? 'border-green-300 text-green-700' :
                            quiz.difficulty === 'moyen' ? 'border-yellow-300 text-yellow-700' :
                            'border-red-300 text-red-700'
                        }`}>
                            {quiz.difficulty}
                        </Badge>
                        {isCached ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border-0 text-[10px] px-1.5 py-0.5">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Offline
                            </Badge>
                        ) : !isLocked && !isOffline && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 px-1.5 text-[10px] text-primary hover:bg-primary/10 rounded-full"
                                onClick={() => handleDownloadQuiz(quiz)}
                                disabled={isDownloading === quiz.id}
                            >
                                {isDownloading === quiz.id ? (
                                    <Loader className="w-3 h-3 animate-spin mr-1" />
                                ) : (
                                    <DownloadCloud className="w-3 h-3 mr-1" />
                                )}
                                Télécharger
                            </Button>
                        )}
                      </div>
                      {quiz.access_type === 'premium' && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-[10px]">
                          <Crown className="w-2.5 h-2.5 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase border-t border-muted pt-3">
                      <span>{quiz.total_questions} questions</span>
                      <span>{quiz.duration_minutes} min</span>
                    </div>
                  </CardContent>
                  <Button 
                    className={`w-full font-bold text-white rounded-t-none h-12 text-sm ${
                      isLocked || (isOffline && !isCached)
                        ? 'bg-gray-400 grayscale'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98]'
                    }`}
                    disabled={isOffline && !isCached}
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
                      ) : (isOffline && !isCached) ? (
                        <>
                           <WifiOff className="w-4 h-4 mr-2" />
                           Indisponible
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
            <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                <ClipboardList className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-muted-foreground">Aucun quiz trouvé</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">Essayez de modifier vos filtres ou revenez plus tard.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
