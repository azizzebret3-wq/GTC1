
// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth.tsx';
import { 
  Trophy, 
  Play, 
  BookOpen, 
  Target,
  Award,
  ArrowRight,
  Crown,
  Zap,
  Flame,
  Sparkles,
  Rocket,
  Loader,
  FileText,
  Video,
  Shuffle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getQuizzesFromFirestore, Quiz, getAttemptsFromFirestore, Attempt, getDocumentsFromFirestore, LibraryDocument } from "@/lib/firestore.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';


export default function Dashboard() {
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [latestContent, setLatestContent] = useState<LibraryDocument[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    streak: 0,
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoadingData(true);
      try {
        const [fetchedQuizzes, fetchedDocuments, fetchedAttempts] = await Promise.all([
          getQuizzesFromFirestore(),
          getDocumentsFromFirestore(),
          getAttemptsFromFirestore(user.uid),
        ]);
        
        setQuizzes(fetchedQuizzes);
        setLatestContent(fetchedDocuments.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0,3));
        setRecentAttempts(fetchedAttempts);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast({
            variant: "destructive",
            title: "Erreur de chargement",
            description: "Impossible de charger les données du tableau de bord."
        })
      } finally {
        setLoadingData(false);
      }
    };
    if (!loading && user) {
      fetchData();
    }
  }, [user, loading, toast]);

  useEffect(() => {
      if (loadingData || !recentAttempts) return;
      const totalQuizzes = quizzes.length;
      const completedQuizzes = recentAttempts.length;
      const averageScore = completedQuizzes > 0 
        ? recentAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / completedQuizzes
        : 0;

      setStats({
        totalQuizzes,
        completedQuizzes,
        averageScore: Math.round(averageScore),
        streak: completedQuizzes, 
      });
  }, [quizzes, recentAttempts, loadingData]);

  const isPremium = userData?.subscription_type === 'premium';
  const isAdmin = userData?.role === 'admin';
  const canAccessPremium = isPremium || isAdmin;

  const handleQuickPractice = () => {
    if (!canAccessPremium) {
      router.push('/dashboard/premium');
      return;
    }

    const availableQuestions = quizzes.flatMap(q => q.questions);

    if (availableQuestions.length < 20) {
      toast({
        title: 'Pas assez de questions',
        description: 'Il n\'y a pas assez de questions dans la banque pour créer un entraînement de 20 questions.',
        variant: 'destructive',
      });
      return;
    }

    const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 20);

    const quickQuiz: Quiz = {
      title: "Entraînement Rapide (20 Qs)",
      description: "Une session intensive de 20 questions sur mesure.",
      category: "Mixte",
      difficulty: "moyen",
      access_type: "premium",
      duration_minutes: 20,
      total_questions: selectedQuestions.length,
      questions: selectedQuestions,
      createdAt: new Date(),
    };
    
    sessionStorage.setItem('generatedQuiz', JSON.stringify(quickQuiz));
    router.push('/dashboard/take-quiz?source=quick-practice');
  };

  if (loading || loadingData) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-2xl w-2/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-square bg-muted rounded-3xl"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-muted rounded-3xl"></div>
            <div className="h-80 bg-muted rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const firstName = userData?.fullName?.split(' ')[0] || 'Champion';
  const recommendedQuizzes = quizzes.filter(q => !q.isMockExam);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <style>{`
          .card-stat {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .card-stat:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 30px -5px rgb(0 0 0 / 0.1);
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
          .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}</style>
        
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black gradient-text">
              Salut {firstName} ! 
            </h1>
            <div className="text-3xl animate-bounce">🚀</div>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            {isAdmin ? "Interface d'administration prête." : "C'est le moment de briller !"}
          </p>
        </div>
        
        {!isPremium && !isAdmin && (
          <Link href="/dashboard/premium" className="w-full lg:w-auto">
            <Card className="card-stat glassmorphism border-2 border-yellow-400/50 shadow-xl overflow-hidden group">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-800 dark:text-yellow-300">Passer Premium</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Accès illimité débloqué</p>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold shadow-lg ml-auto hidden sm:flex">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Activer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="card-stat glassmorphism shadow-xl aspect-square flex flex-col items-center justify-center text-center group border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 transition-transform group-hover:scale-110 group-hover:rotate-3">
             <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current" />
          </div>
          <div className="text-2xl sm:text-4xl font-black text-foreground">{stats.totalQuizzes}</div>
          <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Quiz dispos</div>
        </Card>

        <Card className="card-stat glassmorphism shadow-xl aspect-square flex flex-col items-center justify-center text-center group border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20 mb-3 transition-transform group-hover:scale-110 group-hover:-rotate-3">
             <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="text-2xl sm:text-4xl font-black text-foreground">{stats.completedQuizzes}</div>
          <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Réussites</div>
        </Card>

        <Card className="card-stat glassmorphism shadow-xl aspect-square flex flex-col items-center justify-center text-center group border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-3 transition-transform group-hover:scale-110 group-hover:rotate-3">
             <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="text-2xl sm:text-4xl font-black text-foreground">{stats.averageScore}%</div>
          <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Moyenne</div>
        </Card>

        <Card className="card-stat glassmorphism shadow-xl aspect-square flex flex-col items-center justify-center text-center group border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3 transition-transform group-hover:scale-110 group-hover:-rotate-3">
             <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="text-2xl sm:text-4xl font-black text-foreground">{stats.streak}</div>
          <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Série (jours)</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glassmorphism shadow-xl card-stat border-0 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Shuffle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">Entraînement Rapide</CardTitle>
                    <p className="text-muted-foreground font-medium text-sm">20 questions, 20 minutes.</p>
                  </div>
                </div>
                 <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Une session intensive générée aléatoirement pour maintenir vos réflexes à jour.</p>
               <Button 
                onClick={handleQuickPractice}
                size="lg"
                className={`w-full sm:w-auto font-bold rounded-xl text-white shadow-lg transition-all duration-300 ${!canAccessPremium ? 'bg-gray-400 grayscale' : 'bg-gradient-to-r from-teal-500 to-green-500 hover:scale-105 active:scale-95'}`}
               >
                  {!canAccessPremium ? <Lock className="w-5 h-5 mr-2"/> : <Rocket className="w-5 h-5 mr-2 animate-pulse" />}
                  {canAccessPremium ? 'Lancer la session' : 'Nécessite Premium'}
                </Button>
            </CardContent>
          </Card>

          <Card className="glassmorphism shadow-xl card-stat border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-white fill-current" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Quiz Recommandés</CardTitle>
                  <p className="text-muted-foreground font-medium text-sm">Basés sur votre profil</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                 <div className="text-center py-10">
                  <Loader className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                </div>
              ) : recommendedQuizzes.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <Play className="w-12 h-12 mx-auto mb-4" />
                  <p className="font-bold">Aucun quiz disponible pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedQuizzes.slice(0,4).map((quiz, index) => {
                    const isLocked = quiz.access_type === 'premium' && !canAccessPremium;
                    return (
                        <div key={quiz.id} className="group glassmorphism rounded-2xl p-4 hover:bg-accent/10 transition-all cursor-pointer border-0 shadow-sm hover:shadow-md" onClick={() => isLocked ? router.push('/dashboard/premium') : router.push(`/dashboard/take-quiz?id=${quiz.id}`)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${
                                  index % 4 === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                  index % 4 === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                  index % 4 === 2 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                  'bg-gradient-to-r from-orange-500 to-red-500'
                                }`}>
                                  <Play className="w-6 h-6 text-white fill-current" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                                    {quiz.title}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase">{quiz.category}</Badge>
                                    {quiz.access_type === 'premium' && (
                                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-[10px]">
                                            <Crown className="w-2.5 h-2.5 mr-1" /> Premium
                                        </Badge>
                                    )}
                                  </div>
                                </div>
                            </div>
                            <div className={`rounded-full shadow-md w-10 h-10 flex items-center justify-center transition-all ${
                                  isLocked 
                                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white group-hover:translate-x-1'
                                }`}>
                                {isLocked ? <Lock className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                              </div>
                          </div>
                        </div>
                      );
                  })}
                </div>
              )}
              
              <div className="mt-8 text-center">
                <Link href="/dashboard/quizzes" passHref>
                  <Button variant="outline" className="w-full sm:w-auto font-bold rounded-xl border-primary/20 text-primary hover:bg-primary/5 px-8">
                    Découvrir toutes les matières
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glassmorphism shadow-xl card-stat border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground">Derniers Résultats</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <div className="text-center py-6 opacity-40">
                   <Trophy className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold text-sm">Aucune activité.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAttempts.slice(0, 3).map((attempt) => (
                    <div key={attempt.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:bg-accent/5 ${
                      attempt.percentage >= 80 ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' :
                      attempt.percentage >= 50 ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' :
                      'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                    }`}>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{attempt.quizTitle}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                          {format(new Date(attempt.createdAt), 'dd MMM', { locale: fr })} • {attempt.correctAnswers}/{attempt.totalQuestions} pts
                        </p>
                      </div>
                      <div className={`text-xl font-black ml-3 ${
                          attempt.percentage >= 80 ? 'text-green-600' : 
                          attempt.percentage >= 50 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {attempt.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glassmorphism shadow-xl card-stat border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground">Bibliothèque</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
               {latestContent.length === 0 ? (
                 <div className="text-center py-6 opacity-40">
                  <BookOpen className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold text-sm">Pas encore de ressources.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {latestContent.map((content) => {
                     const isLocked = content.access_type === 'premium' && !canAccessPremium;
                     return (
                        <div key={content.id} className="group glassmorphism p-3 rounded-xl hover:bg-accent/10 transition-all cursor-pointer shadow-sm" onClick={() => isLocked ? router.push('/dashboard/premium') : window.open(content.url, '_blank')}>
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${
                                content.type === 'pdf' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                                'bg-gradient-to-r from-blue-500 to-cyan-500'
                                }`}>
                                {content.type === 'pdf' ? <FileText className="w-4.5 h-4.5 text-white" /> : <Video className="w-4.5 h-4.5 text-white fill-current" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-foreground truncate group-hover:text-primary">
                                        {content.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{content.type}</span>
                                        {content.access_type === 'premium' && <Crown className="w-3 h-3 text-yellow-500" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                     )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
