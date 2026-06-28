
// src/app/dashboard/quizzes/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getQuizzesFromFirestore, Quiz } from '@/lib/firestore.service';
import { getAllLocalQuizzes } from '@/lib/localdb.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader, 
  ClipboardList, 
  ArrowRight, 
  WifiOff, 
  Book, 
  Calculator, 
  TestTube2, 
  Languages, 
  Globe, 
  Scale, 
  Landmark, 
  Brain, 
  Atom, 
  History, 
  Map, 
  FileQuestion, 
  GraduationCap, 
  CheckCheck, 
  Newspaper,
  BrainCircuit,
  Zap
} from 'lucide-react';
import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;

const categoryVisuals: { [key: string]: { icon: IconName; gradient: string; shadow: string } } = {
  'Actualités': { icon: 'Newspaper', gradient: 'from-slate-500 to-gray-600', shadow: 'shadow-gray-500/20' },
  'Mathématiques': { icon: 'Calculator', gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
  'SVT': { icon: 'TestTube2', gradient: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/20' },
  'Français': { icon: 'Languages', gradient: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/20' },
  'Culture Générale': { icon: 'Globe', gradient: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/20' },
  'Histoire': { icon: 'History', gradient: 'from-amber-600 to-yellow-700', shadow: 'shadow-yellow-600/20' },
  'Géographie': { icon: 'Map', gradient: 'from-teal-500 to-cyan-600', shadow: 'shadow-teal-500/20' },
  'Tests Psychotechniques': { icon: 'Brain', gradient: 'from-rose-400 to-pink-500', shadow: 'shadow-rose-400/20' },
  'Physique-Chimie': { icon: 'Atom', gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/20' },
  'Philosophie': { icon: 'GraduationCap', gradient: 'from-purple-600 to-indigo-700', shadow: 'shadow-purple-600/20' },
  'Droit': { icon: 'Scale', gradient: 'from-gray-600 to-slate-700', shadow: 'shadow-slate-600/20' },
  'Économie': { icon: 'Landmark', gradient: 'from-lime-500 to-green-600', shadow: 'shadow-lime-500/20' },
  'Concours Passés': { icon: 'FileQuestion', gradient: 'from-stone-500 to-neutral-600', shadow: 'shadow-stone-500/20' },
  'Accompagnement Final': { icon: 'CheckCheck', gradient: 'from-yellow-400 to-orange-500', shadow: 'shadow-yellow-400/20' },
  'Mixte': { icon: 'BrainCircuit', gradient: 'from-fuchsia-500 to-purple-600', shadow: 'shadow-fuchsia-500/20' },
  'default': { icon: 'Book', gradient: 'from-gray-500 to-gray-600', shadow: 'shadow-gray-500/20' }
};

const Icon = ({ name, ...props }: { name: IconName } & LucideIcons.LucideProps) => {
  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideIcons.LucideProps>;
  if (!LucideIcon) return <Book {...props} />; 
  return <LucideIcon {...props} />;
};

export default function QuizzesCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

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
        
        const regularQuizzes = allQuizzes.filter(q => !q.isMockExam);
        setQuizzes(regularQuizzes);
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
  }, [toast, isOffline]);

  const quizzesByCategory = quizzes.reduce((acc, quiz) => {
    const category = quiz.category || 'Non classé';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(quiz);
    return acc;
  }, {} as Record<string, Quiz[]>);

  const categories = Object.keys(quizzesByCategory).sort();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <style>{`
        .category-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .category-card:active {
          transform: scale(0.98);
        }
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dark .glassmorphism {
          background: rgba(20, 20, 30, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black gradient-text">
                Catégories de Quiz
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                Choisissez une matière pour commencer votre entraînement.
              </p>
            </div>
          </div>
        </div>
      </div>
      
       {isOffline && (
        <Card className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-bold text-yellow-800 dark:text-yellow-300">Mode hors ligne activé</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">Seuls les quiz déjà consultés sont disponibles.</p>
            </div>
          </div>
        </Card>
      )}

      {isLoadingQuizzes ? (
        <div className="flex justify-center items-center h-64">
            <Loader className="w-10 h-10 animate-spin text-purple-500"/>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
          {categories.map((category) => {
            const categoryData = quizzesByCategory[category];
            const visuals = categoryVisuals[category] || categoryVisuals.default;

            return (
              <Card 
                key={category} 
                className="category-card glassmorphism shadow-xl overflow-hidden border-0 cursor-pointer aspect-square"
                onClick={() => router.push(`/dashboard/quizzes/${encodeURIComponent(category)}`)}
              >
                  <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full text-center relative group">
                     {/* Background Glow */}
                     <div className={`absolute inset-0 bg-gradient-to-br ${visuals.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                     
                     <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-r ${visuals.gradient} ${visuals.shadow} mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon name={visuals.icon} className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                     </div>
                     
                     <h3 className="text-sm sm:text-lg font-bold text-foreground leading-tight px-1 mb-2 group-hover:text-primary transition-colors">
                        {category}
                    </h3>
                    
                    <Badge variant="secondary" className="font-bold text-[10px] sm:text-xs bg-secondary/50 backdrop-blur-md">
                        {categoryData.length} quiz
                    </Badge>

                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Zap className={`w-4 h-4 text-primary animate-pulse`} />
                    </div>
                  </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoadingQuizzes && categories.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
            <ClipboardList className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-muted-foreground">Aucun quiz trouvé</h3>
            <p className="text-muted-foreground/80 max-w-xs mx-auto mt-2">
                {isOffline ? "Connectez-vous pour découvrir tous les quiz disponibles." : "Notre équipe prépare de nouveaux contenus pour vous !"}
            </p>
        </div>
      )}
    </div>
  );
}
