// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth.tsx';
import { 
  Trophy, 
  Play, 
  BookOpen, 
  Clock,
  Target,
  Award,
  ArrowRight,
  Crown,
  Calendar,
  Zap,
  Star,
  Flame,
  Sparkles,
  Rocket,
  Loader,
  FileText,
  Video,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getQuizzesFromFirestore, Quiz, getAttemptsFromFirestore, Attempt, getDocumentsFromFirestore, LibraryDocument } from "@/lib/firestore.service";
import { useToast } from "@/hooks/use-toast";


export default function Dashboard() {
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();
  
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

  if (loading || loadingData) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-2xl w-2/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-3xl"></div>
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

  const isPremium = userData?.subscription_type === 'premium';
  const isAdmin = userData?.role === 'admin';
  const firstName = userData?.fullName?.split(' ')[0] || 'Champion';
  const recommendedQuizzes = quizzes.filter(q => !q.isMockExam);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
       <style>{`
          .card-hover {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .card-hover:hover {
            transform: translateY(-6px) scale(1.01);
          }
          .glassmorphism {
            background: hsl(var(--card) / 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid hsl(var(--border) / 0.2);
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
            <div className="text-3xl">🚀</div>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            {isAdmin ? "Prêt à gérer la plateforme ?" : "Prêt à dominer ton concours ?"}
          </p>
        </div>
        
        {!isPremium && !isAdmin && (
          <Link href="/dashboard/premium" passHref>
            <Card className="card-hover glassmorphism border-2 border-yellow-400/50 shadow-xl w-full lg:w-auto">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-800 dark:text-yellow-300">Passer Premium</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Débloquer tout</p>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold shadow-lg ml-auto">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Allons-y
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 transition-all dark:from-blue-500/20 dark:to-cyan-500/20 dark:group-hover:from-blue-500/30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Quiz</CardTitle>
            <Play className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-0">
            <div className="text-2xl font-black text-foreground">{stats.totalQuizzes}</div>
          </CardContent>
        </Card>

        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 group-hover:from-green-500/20 transition-all dark:from-green-500/20 dark:to-emerald-500/20 dark:group-hover:from-green-500/30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Complétés</CardTitle>
             <Target className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-0">
            <div className="text-2xl font-black text-foreground">{stats.completedQuizzes}</div>
          </CardContent>
        </Card>

        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 transition-all dark:from-purple-500/20 dark:to-pink-500/20 dark:group-hover:from-purple-500/30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Score</CardTitle>
            <Trophy className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-0">
            <div className="text-2xl font-black text-foreground">{stats.averageScore}%</div>
          </CardContent>
        </Card>

        <Card className="card-hover glassmorphism shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 group-hover:from-orange-500/20 transition-all dark:from-orange-500/20 dark:to-red-500/20 dark:group-hover:from-orange-500/30"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 p-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Série</CardTitle>
            <Flame className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-0">
            <div className="text-2xl font-black text-foreground">{stats.streak}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glassmorphism shadow-xl card-hover border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Shuffle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Entraînement Rapide</CardTitle>
                  <p className="text-muted-foreground font-medium text-sm">Testez-vous sur des questions aléatoires.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Lancez une session de questions tirées au hasard de notre banque de quiz pour une révision express.</p>
               <Link href="/dashboard/quizzes" passHref>
                  <Button className="font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg">
                    <Rocket className="w-4 h-4 mr-2" />
                    Commencer une session
                  </Button>
                </Link>
            </CardContent>
          </Card>
          <Card className="glassmorphism shadow-xl card-hover border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Quiz Recommandés</CardTitle>
                  <p className="text-muted-foreground font-medium text-sm">Sélectionnés pour vous</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                 <div className="text-center py-10">
                  <Loader className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Chargement des quiz...</h3>
                </div>
              ) : recommendedQuizzes.length === 0 ? (
                <div className="text-center py-10">
                  <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Aucun quiz disponible</h3>
                  <p className="text-muted-foreground/80 text-sm">Revenez bientôt !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedQuizzes.slice(0,4).map((quiz, index) => (
                    <div key={quiz.id} className="group bg-background/60 backdrop-blur-sm border border-border/40 rounded-xl p-3 hover:bg-accent/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                              index % 4 === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              index % 4 === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                              index % 4 === 2 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              'bg-gradient-to-r from-orange-500 to-red-500'
                            }`}>
                              <Play className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground group-hover:text-purple-600 transition-colors text-sm">
                                {quiz.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{quiz.category}</Badge>
                                <Badge variant="outline" className={`text-xs capitalize ${
                                  quiz.difficulty === 'facile' ? 'border-green-400/50 text-green-600 dark:text-green-400' :
                                  quiz.difficulty === 'moyen' ? 'border-yellow-400/50 text-yellow-600 dark:text-yellow-400' :
                                  'border-red-400/50 text-red-600 dark:text-red-400'
                                }`}>
                                  {quiz.difficulty}
                                </Badge>
                              </div>
                            </div>
                        </div>
                        <Link href={`/dashboard/take-quiz?id=${quiz.id}`} passHref>
                          <Button 
                            size="icon"
                            className={`rounded-full shadow-md w-10 h-10 ${
                              quiz.access_type === 'premium' && !isPremium 
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                            }`}
                            disabled={quiz.access_type === 'premium' && !isPremium && !isAdmin}
                          >
                             {quiz.access_type === 'premium' && !isPremium && !isAdmin ? <Crown className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 text-center">
                <Link href="/dashboard/quizzes" passHref>
                  <Button variant="outline" size="sm" className="font-semibold rounded-lg hover:bg-accent border-primary/20 text-primary">
                    <Zap className="w-4 h-4 mr-2" />
                    Voir tous les quiz
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glassmorphism shadow-xl card-hover border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground">Derniers Résultats</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <div className="text-center py-6">
                   <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium text-sm">Aucun résultat encore</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAttempts.slice(0, 3).map((attempt) => (
                    <div key={attempt.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                      attempt.percentage >= 80 ? 'bg-green-500/10 border-green-500/20' :
                      attempt.percentage >= 60 ? 'bg-yellow-500/10 border-yellow-500/20' :
                      'bg-red-500/10 border-red-500/20'
                    }`}>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{attempt.quizTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(attempt.createdAt), 'dd MMM', { locale: fr })} - {attempt.correctAnswers}/{attempt.totalQuestions}
                        </p>
                      </div>
                      <div className={`text-lg font-black ${
                          attempt.percentage >= 80 ? 'text-green-600' : 
                          attempt.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {attempt.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glassmorphism shadow-xl card-hover border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground">Nouveau Contenu</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
               {latestContent.length === 0 ? (
                 <div className="text-center py-6">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium text-sm">Aucun contenu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {latestContent.map((content) => (
                     <Link key={content.id} href={content.url} target="_blank" rel="noopener noreferrer" className="group block">
                        <div className="p-3 border border-border/50 rounded-lg hover:bg-accent/50 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${
                            content.type === 'pdf' ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                            'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}>
                            {content.type === 'pdf' ? <FileText className="w-4 h-4 text-white" /> : <Video className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate group-hover:text-purple-600">
                                {content.title}
                            </p>
                            <Badge variant="outline" className="text-xs capitalize mt-1">
                                {content.type}
                                </Badge>
                            </div>
                             {content.access_type === 'premium' && <Crown className="w-4 h-4 text-yellow-500" />}
                        </div>
                        </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    

    