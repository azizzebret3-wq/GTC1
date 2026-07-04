'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Loader, 
  ArrowLeft, 
  ArrowRight, 
  Trophy,
  CheckCircle2,
  XCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { getQuizzesFromFirestore, Quiz, saveAttemptToFirestore } from '@/lib/firestore.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth.tsx';
import MathText from '@/components/math-text';
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

function TakeQuizComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, reloadUserData } = useAuth();
  
  const [quiz, setQuiz] = useState<ActiveQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[][]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const handleFinishQuiz = useCallback(async () => {
    if (!quiz || !user || quizFinished) return;
    
    setQuizFinished(true);

    const quizSource = searchParams.get('source');
    
    const newResults: QuestionResult[] = quiz.questions.map((q, index) => {
      const userSelection = userAnswers[index] || [];
      const isCorrect = userSelection.length === q.correctAnswers.length &&
                        userSelection.every(ans => q.correctAnswers.includes(ans));

      return {
        question: q.question,
        options: q.options,
        selectedAnswers: userSelection,
        correctAnswers: q.correctAnswers,
        isCorrect,
        explanation: q.explanation,
      };
    });
    setResults(newResults);

    const score = newResults.filter(r => r.isCorrect).length;
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const xpEarned = score * 50 + (percentage === 100 ? 200 : 0);

    try {
      if (quizSource !== 'generated' && !quiz.id.startsWith('generated-')) {
        await saveAttemptToFirestore({
          userId: user.uid,
          quizId: quiz.id,
          quizTitle: quiz.title,
          score,
          totalQuestions: quiz.questions.length,
          percentage,
          correctAnswers: score,
          createdAt: new Date(),
          xpEarned,
        });
        await reloadUserData();
      }
    } catch (e) {
      console.error(e);
    }
  }, [quiz, user, searchParams, userAnswers, quizFinished, reloadUserData]);

  useEffect(() => {
    const load = async () => {
      const id = searchParams.get('id');
      const source = searchParams.get('source');
      try {
        let data: Quiz | null = null;
        if (source === 'generated' || source === 'quick-practice') {
          const stored = sessionStorage.getItem('generatedQuiz');
          if (stored) data = JSON.parse(stored);
        } else if (id) {
          const all = await getQuizzesFromFirestore();
          data = all.find(q => q.id === id) || null;
        }

        if (data && data.questions.length > 0) {
          setQuiz({ id: id || `gen-${Date.now()}`, ...data });
          setUserAnswers(new Array(data.questions.length).fill([]));
          setTimeLeft((data.duration_minutes || data.questions.length) * 60);
        } else {
          router.push('/dashboard/quizzes');
        }
      } catch (e) {
        router.push('/dashboard/quizzes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams, router]);

  useEffect(() => {
    if (quiz && !quizFinished && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && quiz && !quizFinished) {
      handleFinishQuiz();
    }
  }, [quiz, quizFinished, timeLeft, handleFinishQuiz]);

  const toggleOption = (option: string) => {
    setUserAnswers(prev => {
      const current = [...prev];
      const selected = current[currentQuestionIndex] || [];
      if (selected.includes(option)) {
        current[currentQuestionIndex] = selected.filter(o => o !== option);
      } else {
        current[currentQuestionIndex] = [...selected, option];
      }
      return current;
    });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading || !quiz) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader className="w-12 h-12 animate-spin text-primary" />
        <p className="font-bold text-lg animate-pulse">Chargement de votre examen...</p>
      </div>
    );
  }

  if (quizFinished) {
    const score = results.filter(r => r.isCorrect).length;
    const pct = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="max-w-4xl mx-auto p-4 py-12 space-y-8">
        <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-zinc-900 rounded-3xl">
          <div className="h-3 w-full bg-gradient-to-r from-primary to-accent"></div>
          <div className="p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
               <Trophy className="w-12 h-12 text-yellow-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight">{pct}% de réussite</h1>
              <p className="text-muted-foreground font-medium text-lg">« {quiz.title} »</p>
            </div>
            <div className="text-6xl font-black text-primary">
               {score} <span className="text-2xl text-muted-foreground">/ {quiz.questions.length}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" className="rounded-2xl font-bold h-14 px-8" onClick={() => router.push('/dashboard/quizzes')}>
                 Retour aux Quiz
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl font-bold h-14 px-8" onClick={() => window.location.reload()}>
                 Recommencer
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-3">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
             </div>
             Correction Détaillée
          </h2>
          {results.map((r, i) => (
            <Card key={i} className={cn(
              "border-0 shadow-lg rounded-2xl overflow-hidden transition-all",
              r.isCorrect ? "bg-emerald-50/50 dark:bg-emerald-950/10" : "bg-rose-50/50 dark:bg-rose-950/10"
            )}>
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex gap-4 items-start">
                   <div className={cn(
                     "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 mt-1",
                     r.isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                   )}>
                     {i + 1}
                   </div>
                   <div className="text-xl font-bold leading-relaxed">
                     <MathText text={r.question} />
                   </div>
                </div>

                <div className="grid gap-3 pl-0 md:pl-12">
                  {r.options.map((opt, oi) => {
                    const isSelected = r.selectedAnswers.includes(opt);
                    const isCorrect = r.correctAnswers.includes(opt);
                    return (
                      <div key={oi} className={cn(
                        "p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
                        isCorrect ? "border-emerald-500 bg-white dark:bg-zinc-800 shadow-sm" : 
                        isSelected && !isCorrect ? "border-rose-500 bg-white dark:bg-zinc-800" : 
                        "border-transparent bg-zinc-100 dark:bg-zinc-800/50"
                      )}>
                        {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                         isSelected ? <XCircle className="w-5 h-5 text-rose-500" /> : 
                         <div className="w-5 h-5 rounded-full border-2 border-zinc-300" />}
                        <div className={cn("text-base", isCorrect && "font-bold text-emerald-700 dark:text-emerald-400")}>
                          <MathText text={opt} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {r.explanation && (
                  <div className="mt-4 p-5 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border-l-4 border-indigo-500 flex gap-4">
                    <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div className="text-sm leading-relaxed">
                      <p className="font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest text-[10px] mb-1">Note de l'expert :</p>
                      <MathText text={r.explanation} />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const q = quiz.questions[currentQuestionIndex];
  const selected = userAnswers[currentQuestionIndex] || [];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500",
      isFocusMode ? "bg-zinc-50 dark:bg-black pt-0" : "bg-background pt-8 pb-24 px-4"
    )}>
      {/* HUD - En-tête de l'examen */}
      <div className={cn(
        "max-w-5xl mx-auto mb-8 transition-all",
        isFocusMode && "sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 border-b"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
             {!isFocusMode && (
               <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
                 <ChevronLeft className="w-6 h-6" />
               </Button>
             )}
             <div>
                <h2 className="text-xl font-black tracking-tight truncate max-w-[200px] sm:max-w-md">{quiz.title}</h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Question {currentQuestionIndex + 1} / {quiz.questions.length}
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-lg",
              timeLeft < 60 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-primary/10 text-primary"
            )}>
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsFocusMode(!isFocusMode)} className="hidden sm:flex">
              {isFocusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 rounded-full" />
      </div>

      {/* Zone de Question Centrale */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-12 py-8">
            {/* Énoncé */}
            <div className="text-center md:text-left space-y-6">
              <h3 className="text-3xl md:text-5xl font-black leading-tight text-zinc-900 dark:text-zinc-100">
                <MathText text={q.question} />
              </h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                 Sélectionnez la ou les bonnes réponses
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {q.options.map((opt, i) => {
                 const isChecked = selected.includes(opt);
                 return (
                    <button
                      key={i}
                      onClick={() => toggleOption(opt)}
                      className={cn(
                        "group relative p-6 md:p-8 rounded-3xl border-4 text-left transition-all duration-300 active:scale-[0.98]",
                        isChecked 
                          ? "bg-primary border-primary text-white shadow-2xl shadow-primary/30" 
                          : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-primary/30 text-zinc-800 dark:text-zinc-200"
                      )}
                    >
                       <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            isChecked ? "bg-white border-white text-primary" : "border-zinc-300 dark:border-zinc-600 group-hover:border-primary"
                          )}>
                            {isChecked && <CheckCircle2 className="w-5 h-5" />}
                          </div>
                          <div className="text-xl md:text-2xl font-bold leading-snug">
                             <MathText text={opt} />
                          </div>
                       </div>
                       {/* Badge de raccourci (A, B, C...) */}
                       <div className="absolute top-2 right-4 text-[10px] font-black opacity-20 group-hover:opacity-40">
                          CHOIX {String.fromCharCode(65 + i)}
                       </div>
                    </button>
                 );
               })}
            </div>
          </div>
        </div>
      </div>

      {/* Barre de Navigation Fixe */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t z-50">
        <div className="max-w-5xl mx-auto flex justify-between gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(c => c - 1)}
            className="rounded-2xl h-14 px-6 font-black border-2"
          >
            <ChevronLeft className="w-6 h-6 mr-2" />
            Précédent
          </Button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
             <Button 
              size="lg" 
              onClick={handleFinishQuiz}
              className="rounded-2xl h-14 px-10 font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl hover:scale-105 transition-transform"
             >
               Terminer l'examen
             </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={() => setCurrentQuestionIndex(c => c + 1)}
              className="rounded-2xl h-14 px-10 font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl hover:scale-105 transition-transform"
            >
              Suivant
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TakeQuizPage() {
    return (
        <React.Suspense fallback={
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <Loader className="w-12 h-12 animate-spin text-primary" />
                <p className="font-bold text-lg">Initialisation de la session...</p>
            </div>
        }>
            <TakeQuizComponent />
        </React.Suspense>
    )
}
