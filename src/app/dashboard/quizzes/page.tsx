// src/app/dashboard/quizzes/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getQuizzesFromFirestore, Quiz } from '@/lib/firestore.service';
import { getAllLocalQuizzes } from '@/lib/localdb.service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader, ClipboardList, ArrowRight, WifiOff, Book, Calculator, TestTube2, Languages, Globe, Scale, Landmark, Brain, Atom, History, Map, FileQuestion, GraduationCap, CheckCheck, Newspaper } from 'lucide-react';
import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;

const categoryVisuals: { [key: string]: { icon: IconName; gradient: string } } = {
  'Actualités': { icon: 'Newspaper', gradient: 'from-slate-500 to-gray-600'},
  'Mathématiques': { icon: 'Calculator', gradient: 'from-blue-500 to-cyan-500' },
  'SVT': { icon: 'TestTube2', gradient: 'from-green-500 to-emerald-500' },
  'Français': { icon: 'Languages', gradient: 'from-orange-500 to-amber-500' },
  'Culture Générale': { icon: 'Globe', gradient: 'from-indigo-500 to-purple-600' },
  'Histoire': { icon: 'History', gradient: 'from-amber-600 to-yellow-700' },
  'Géographie': { icon: 'Map', gradient: 'from-teal-500 to-cyan-600' },
  'Tests Psychotechniques': { icon: 'Brain', gradient: 'from-rose-400 to-pink-500' },
  'Physique-Chimie': { icon: 'Atom', gradient: 'from-sky-500 to-blue-600' },
  'Philosophie': { icon: 'GraduationCap', gradient: 'from-purple-600 to-indigo-700' },
  'Droit': { icon: 'Scale', gradient: 'from-gray-600 to-slate-700' },
  'Économie': { icon: 'Landmark', gradient: 'from-lime-500 to-green-600' },
  'Concours Passés': { icon: 'FileQuestion', gradient: 'from-stone-500 to-neutral-600' },
  'Accompagnement Final': { icon: 'CheckCheck', gradient: 'from-yellow-400 to-orange-500' },
  'Mixte': { icon: 'BrainCircuit', gradient: 'from-fuchsia-500 to-purple-600' },
  'default': { icon: 'Book', gradient: 'from-gray-500 to-gray-600' }
};

const Icon = ({ name, ...props }: { name: IconName } & LucideIcons.LucideProps) => {
  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideIcons.LucideProps>;
  if (!LucideIcon) return <Book {...props} />; // Fallback icon
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
          if (allQuizzes.length === 0) {
            toast({
              title: "Mode hors ligne",
              description: "Aucun quiz n'a été sauvegardé pour une consultation hors ligne.",
              variant: 'default',
            });
          }
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

  const categories = Object.keys(quizzesByCategory);

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
                Catégories de Quiz
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                Choisissez une matière pour commencer votre entraînement.
              </p>
            </div>
          </div>
        </div>
      </div>
      
       {isOffline && (
        <Card className="bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 p-4">
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const categoryData = quizzesByCategory[category];
              const visuals = categoryVisuals[category] || categoryVisuals.default;

              return (
                <Card 
                  key={category} 
                  className="card-hover glassmorphism shadow-xl group overflow-hidden border-0 cursor-pointer"
                  onClick={() => router.push(`/dashboard/quizzes/${encodeURIComponent(category)}`)}
                >
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                       <div>
                          <div className="flex items-center justify-between">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${visuals.gradient} group-hover:scale-110 transition-transform`}>
                                  <Icon name={visuals.icon} className="w-6 h-6 text-white" />
                              </div>
                               <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                           <h3 className="text-xl font-bold text-foreground mt-4 group-hover:text-purple-600 transition-colors">
                              {category}
                          </h3>
                       </div>
                       <Badge variant="secondary" className="mt-2 font-semibold w-fit">
                          {categoryData.length} quiz
                      </Badge>
                    </CardContent>
                </Card>
              );
            })}
          </div>
          {categories.length === 0 && (
            <div className="text-center py-10 col-span-full">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-1">Aucun quiz trouvé</h3>
                <p className="text-gray-500 text-sm">{isOffline ? "Veuillez vous connecter pour voir tous les quiz." : "De nouveaux quiz seront bientôt ajoutés."}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
