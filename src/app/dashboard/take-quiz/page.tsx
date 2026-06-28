// src/app/dashboard/take-quiz/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Info, 
  Award, 
  Activity, 
  Loader, 
  ArrowLeft, 
  ArrowRight, 
  Heart, 
  Users,
  Trophy,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen
} from 'lucide-react';
import { getQuizzesFromFirestore, Quiz, saveAttemptToFirestore } from '@/lib/firestore.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth.tsx';
import MathText from '@/components/math-text';
import { saveQuizLocally, getQuizLocally } from '@/lib/localdb.service';
import { cn } from '@/lib/utils';

type ActiveQuiz = Omit<Quiz, 'id'> & { id: string };

type QuestionResult = {
  question: string;
  options: string[];
  selectedAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
  explanation?: string;
};

const EncouragementCard = ({ score, total }: { score: number; total: number }) => {
  const percentage = total > 0 ? (score / total) * 100 : 0;
  let title = '';
  let message = '';
  let gradient = '';

  if (percentage >= 80) {
    title = 'Impressionnant !';
    message = 'Vous maîtrisez parfaitement ce sujet. Vous êtes sur la voie royale de la réussite ! 🏆';
    gradient = 'from-emerald-500 to-teal-600';
  } else if (percentage >= 50) {
    title = 'Bien joué !';
    message = 'C\'est un résultat solide. Un peu plus de révisions sur les points faibles et vous serez au sommet. 💪';
    gradient = 'from-blue-500 to-indigo-600';
  } else {
    title = 'Ne lâchez rien !';
    message = 'Chaque erreur est une marche vers le succès. Analysez les corrections, apprenez, et revenez plus fort. ✨';
    gradient = 'from-rose-500 to-pink-600';
  }

  return (
    <Card className={cn("text-white shadow-2xl border-0 overflow-hidden relative", `bg-gradient-to-br ${gradient}`)}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24 rotate-12" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-black italic">
          <Heart className="w-8 h-8 fill-current animate-pulse" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium opacity-90 leading-relaxed">{message}</p>
      </CardContent>
    </Card>
  );
};

const RankingCard = ({ score, totalQuestions }: { score: number; totalQuestions: number }) => {
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [rank, setRank] = useState(0);

  useEffect(() => {
    const simulatedParticipants = Math.floor(Math.random() * 51) + 150;
    setTotalParticipants(simulatedParticipants);

    const normalizedScore = (score / totalQuestions) * 100;
    let calculatedRank = 0;
    const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    if (normalizedScore >= 95) calculatedRank = randomInRange(1, 3);
    else if (normalizedScore >= 80) calculatedRank = randomInRange(4, 15);
    else if (normalizedScore >= 60) calculatedRank = randomInRange(16, 45);
    else if (normalizedScore >= 40) calculatedRank = randomInRange(46, 80);
    else calculatedRank = randomInRange(81, simulatedParticipants);

    setRank(calculatedRank);
  }, [score, totalQuestions]);
  
  if (rank === 0) return null;

  return (
      <Card className="glassmorphism shadow-2xl border-0 overflow-hidden group">
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-xl font-black gradient-text">
                  <Users className="w-6 h-6 text-indigo-500"/>
                  Performance Globale
              </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-6">
              <div className="relative inline-block mb-2">
                <p className="text-6xl font-black tracking-tighter text-foreground group-hover:scale-110 transition-transform">
                  {rank}
                  <span className="text-xl font-bold text-muted-foreground ml-1">ème</span>
                </p>
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">sur {totalParticipants} participants</p>
              <div className="mt-6 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                Vous faites partie des meilleurs candidats !
              </div>
          </CardContent>
      </Card>
  );
};


function TakeQuizComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<ActiveQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[][]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);

  const handleFinishQuiz = useCallback(async () => {
    if (!quiz || !user || quizFinished) return;
    
    setQuizFinished(true);

    const quizSource = searchParams.get('source');
    if (quizSource === 'generated' || quizSource === 'quick-practice') {
      sessionStorage.removeItem('generatedQuiz');
    }
    
    if (!quiz.questions) {
      toast({ title: 'Erreur de Quiz', description: "Ce quiz ne contient aucune question.", variant: 'destructive' });
      router.push('/dashboard/quizzes');
      return;
    }

    const newResults: QuestionResult[] = quiz.questions.map((q, index) => {
      const userSelection = userAnswers[index] || [];
      const correctAnswers = q.correctAnswers || [];
      const isCorrect = userSelection.length === correctAnswers.length &&
                        userSelection.sort().every((answer, i) => answer === [...correctAnswers].sort()[i]);

      return {
        question: q.question,
        options: q.options,
        selectedAnswers: userSelection,
        correctAnswers: correctAnswers,
        isCorrect,
        explanation: q.explanation,
      };
    });
    setResults(newResults);

    const score = newResults.filter(r => r.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    
    try {
      if (quizSource !== 'generated' && quizSource !== 'quick-practice') {
           await saveAttemptToFirestore({
              userId: user.uid,
              quizId: quiz.id,
              quizTitle: quiz.title,
              score: score,
              totalQuestions: totalQuestions,
              percentage: Math.round((score / totalQuestions) * 100),
              correctAnswers: score,
              createdAt: new Date(),
          });
          toast({ title: 'Résultats enregistrés !', description: 'Votre performance a été sauvegardée.' });
        }
    } catch(error) {
        console.error("Failed to save attempt", error);
        toast({ title: 'Erreur', description: "Impossible d'enregistrer vos résultats.", variant: 'destructive' });
    }
  }, [quiz, user, searchParams, userAnswers, toast, quizFinished, router]);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      const quizIdParam = searchParams.get('id');
      const sourceParam = searchParams.get('source');
      const isOffline = !navigator.onLine;
  
      let loadedQuizData: Quiz | null = null;
  
      try {
        if (sourceParam === 'generated' || sourceParam === 'quick-practice') {
          const quizDataString = sessionStorage.getItem('generatedQuiz');
          if (quizDataString) {
            loadedQuizData = JSON.parse(quizDataString);
          }
        } else if (quizIdParam) {
          if (isOffline) {
            loadedQuizData = await getQuizLocally(quizIdParam);
          } else {
            const allQuizzes = await getQuizzesFromFirestore();
            loadedQuizData = allQuizzes.find(q => q.id === quizIdParam) || null;
            if (loadedQuizData) {
              await saveQuizLocally(loadedQuizData);
            }
          }
        }
  
        if (loadedQuizData && loadedQuizData.questions && loadedQuizData.questions.length > 0) {
          const activeQuiz: ActiveQuiz = {
            id: loadedQuizData.id || `generated-${Date.now()}`,
            ...loadedQuizData,
          };
          setQuiz(activeQuiz);
          setUserAnswers(Array(activeQuiz.questions.length).fill([]));
          let duration = activeQuiz.duration_minutes || activeQuiz.questions.length;
          setTimeLeft(duration * 60);
        } else {
          toast({ title: 'Erreur', description: 'Le quiz est invalide ou introuvable.', variant: 'destructive' });
          router.push('/dashboard/quizzes');
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        toast({ title: 'Erreur de chargement', description: 'Impossible de charger le quiz.', variant: 'destructive' });
        router.push('/dashboard/quizzes');
      } finally {
        setLoading(false);
      }
    };
  
    loadQuiz();
  }, [router, toast, searchParams]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quiz && !quizFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft <= 0 && !quizFinished) {
      handleFinishQuiz();
    }
    return () => clearInterval(timer);
  }, [quiz, quizFinished, timeLeft, handleFinishQuiz]);


  const handleNextQuestion = () => {
    if (!quiz || !quiz.questions) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleAnswerChange = (option: string, checked: boolean) => {
    setUserAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      let currentAnswersForQuestion = newAnswers[currentQuestionIndex] || [];
      
      if (checked) {
        currentAnswersForQuestion = [...currentAnswersForQuestion, option];
      } else {
        currentAnswersForQuestion = currentAnswersForQuestion.filter(
          (ans) => ans !== option
        );
      }
      
      newAnswers[currentQuestionIndex] = currentAnswersForQuestion;
      return newAnswers;
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading || !quiz) {
    return (
      <div className="flex flex-col gap-6 justify-center items-center h-screen bg-background">
          <div className="relative">
            <Loader className="w-16 h-16 animate-spin text-primary" />
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
          <p className="font-black text-xl gradient-text animate-pulse">Préparation de votre succès...</p>
      </div>
    );
  }
  
  const score = results.filter(r => r.isCorrect).length;

  if (quizFinished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-5xl mx-auto pb-24">
        {/* Header Résultats */}
        <Card className="glassmorphism shadow-2xl border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"></div>
          <CardHeader className="text-center pt-10 pb-6 relative z-10">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6 transform rotate-3">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-4xl font-black gradient-text tracking-tighter mb-2">Résultats : {percentage}%</CardTitle>
            <CardDescription className="text-lg font-bold text-muted-foreground">« {quiz.title} »</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-8 relative z-10 pb-10">
            <div className="flex flex-col items-center">
                <p className="text-7xl font-black text-foreground mb-4">
                {score} <span className="text-3xl text-muted-foreground">/ {quiz.questions.length}</span>
                </p>
                <div className="w-full max-w-md h-4 bg-muted rounded-full overflow-hidden mb-8 border shadow-inner">
                   <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 ease-out" 
                    style={{ width: `${percentage}%` }}
                   ></div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => router.push('/dashboard/quizzes')} className="h-12 px-8 rounded-xl font-bold bg-primary text-white shadow-xl hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5 mr-2" /> Retour aux Quiz
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()} className="h-12 px-8 rounded-xl font-bold border-2 hover:bg-muted transition-all">
                      Recommencer
                  </Button>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Grille de stats secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {quiz.isMockExam && <RankingCard score={score} totalQuestions={quiz.questions.length} />}
            <EncouragementCard score={score} total={quiz.questions.length} />
        </div>
        
        {/* Correction Détaillée */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-600" />
             </div>
             <h2 className="text-2xl font-black text-foreground tracking-tight">Correction Pédagogique</h2>
          </div>
          
          {results.map((result, index) => (
            <Card key={index} className="glassmorphism shadow-xl border-0 overflow-hidden border-l-8" style={{borderLeftColor: result.isCorrect ? '#10b981' : '#ef4444'}}>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-start gap-4">
                   <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-black shrink-0 mt-1">{index + 1}</span>
                   <div className="text-lg md:text-xl font-bold leading-relaxed text-foreground">
                      <MathText text={result.question} />
                   </div>
                </div>

                <div className="grid gap-3 pl-0 md:pl-12">
                  {result.options.map((option, oIdx) => {
                    const isSelected = result.selectedAnswers.includes(option);
                    const isCorrect = result.correctAnswers.includes(option);
                    
                    let stateClass = "border-2 bg-muted/20 text-muted-foreground border-transparent";
                    if (isSelected && !isCorrect) stateClass = "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-bold";
                    if (isCorrect) stateClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold";

                    return (
                      <div key={oIdx} className={cn("flex items-center gap-4 p-4 rounded-2xl transition-all", stateClass)}>
                         <div className="shrink-0">
                            {isCorrect ? (
                               <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                  <CheckCircle className="w-4 h-4" />
                               </div>
                            ) : isSelected ? (
                               <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white">
                                  <XCircle className="w-4 h-4" />
                               </div>
                            ) : (
                               <div className="w-6 h-6 rounded-full border-2 border-muted"></div>
                            )}
                         </div>
                         <div className="text-base flex-1">
                            <MathText text={option} />
                         </div>
                      </div>
                    );
                  })}
                </div>

                {result.explanation && (
                  <div className="mt-6 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/30 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
                        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="font-black text-indigo-700 dark:text-indigo-300 text-sm uppercase tracking-wider mb-1">L'avis de l'expert :</h4>
                        <div className="text-indigo-900 dark:text-indigo-200 text-base leading-relaxed">
                            <MathText text={result.explanation} />
                        </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswersForCurrent = userAnswers[currentQuestionIndex] || [];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center min-h-[calc(100vh-100px)] max-w-4xl mx-auto pb-24">
      {/* Quiz Header Bar */}
      <div className="w-full glassmorphism p-4 rounded-2xl shadow-xl mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.back()}>
                      <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <div>
                      <h2 className="font-black text-lg gradient-text leading-none mb-1">{quiz.title}</h2>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Question {currentQuestionIndex + 1} sur {quiz.questions.length}</p>
                  </div>
              </div>
              <div className={cn(
                  "flex items-center gap-2 font-black px-4 py-2 rounded-xl text-sm transition-colors",
                  timeLeft < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-primary/10 text-primary"
              )}>
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeLeft)}</span>
              </div>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
      </div>

      {/* Question Card */}
      <Card className="w-full glassmorphism shadow-2xl border-0 overflow-hidden">
        <CardContent className="p-6 md:p-10 space-y-10">
          <div className="text-xl md:text-2xl font-bold text-foreground leading-relaxed text-center md:text-left">
            <MathText text={currentQuestion.question} />
          </div>

          <div className="grid gap-4">
            {currentQuestion.options.map((option, index) => {
              const isChecked = selectedAnswersForCurrent.includes(option);
              return (
                 <label 
                    key={index} 
                    className={cn(
                        "flex items-center space-x-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 hover:translate-x-1",
                        isChecked 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20" 
                            : "bg-white/50 dark:bg-black/20 border-transparent hover:border-primary/30"
                    )}
                 >
                    <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                        isChecked ? "border-white bg-white text-indigo-600" : "border-muted-foreground/30"
                    )}>
                        <Checkbox 
                            id={`option-${index}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleAnswerChange(option, !!checked)}
                            className="hidden"
                        />
                        {isChecked && <div className="w-2.5 h-2.5 bg-current rounded-full" />}
                    </div>
                    <span className="font-bold text-lg md:text-xl flex-1">
                        <MathText text={option} />
                    </span>
                 </label>
              )
            })}
          </div>

          <p className="text-xs font-black text-muted-foreground text-center uppercase tracking-widest opacity-60">
             Un ou plusieurs choix possibles
          </p>

          <div className="flex justify-between gap-4 pt-6 border-t border-muted">
            <Button 
                onClick={handlePreviousQuestion} 
                variant="outline" 
                disabled={currentQuestionIndex === 0}
                className="h-14 px-6 rounded-2xl font-black transition-all hover:bg-muted"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Précédent
            </Button>
            
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button 
                onClick={() => handleFinishQuiz()} 
                className="h-14 px-10 rounded-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xl hover:scale-105 transition-transform"
              >
                Terminer le Quiz
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion} 
                className="h-14 px-10 rounded-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-2xl hover:scale-105 transition-transform"
              >
                Suivant
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TakeQuizPage() {
    return (
        <React.Suspense fallback={
            <div className="flex flex-col gap-6 justify-center items-center h-screen bg-background">
                <Loader className="w-16 h-16 animate-spin text-primary" />
                <p className="font-black text-xl gradient-text animate-pulse">Chargement de votre session...</p>
            </div>
        }>
            <TakeQuizComponent />
        </React.Suspense>
    )
}
