// src/app/dashboard/take-quiz/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Info, Award, Activity, Loader, ArrowLeft, ArrowRight, Heart, Users } from 'lucide-react';
import { getQuizzesFromFirestore, Quiz, saveAttemptToFirestore } from '@/lib/firestore.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth.tsx';
import MathText from '@/components/math-text';

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
  let color = '';

  if (percentage >= 80) {
    title = 'Excellent travail !';
    message = 'Vous maîtrisez le sujet. Continuez sur cette lancée impressionnante !';
    color = 'from-green-500 to-emerald-500';
  } else if (percentage >= 50) {
    title = 'Bon effort !';
    message = 'Vous êtes sur la bonne voie. La persévérance est la clé du succès. Analysez vos erreurs et continuez à vous entraîner.';
    color = 'from-blue-500 to-cyan-500';
  } else {
    title = 'Ne baissez pas les bras !';
    message = 'Chaque erreur est une opportunité d\'apprendre. Ce quiz est un pas de plus vers votre réussite. Continuez à travailler dur !';
    color = 'from-orange-500 to-red-500';
  }

  return (
    <Card className={`bg-gradient-to-r ${color} text-white shadow-xl`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-6 h-6" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{message}</p>
      </CardContent>
    </Card>
  );
};

const RankingCard = ({ score, totalQuestions }: { score: number; totalQuestions: number }) => {
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [rank, setRank] = useState(0);

  useEffect(() => {
    // Simuler un nombre de participants pour donner un contexte
    const simulatedParticipants = Math.floor(Math.random() * 51) + 150; // Entre 150 et 200
    setTotalParticipants(simulatedParticipants);

    // Normaliser le score sur une base de 50 pour la logique de classement
    const normalizedScore = (score / totalQuestions) * 50;

    let calculatedRank = 0;
    
    // Fonction pour générer un nombre aléatoire dans une plage
    const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    if (normalizedScore >= 50) {
      calculatedRank = 1; // Premier
    } else if (normalizedScore >= 45) {
      calculatedRank = randomInRange(2, 5); // 2ème à 5ème
    } else if (normalizedScore >= 40) {
      calculatedRank = randomInRange(6, 15); // 6ème à 15ème
    } else if (normalizedScore >= 30) {
      calculatedRank = randomInRange(16, 40); // 16ème à 40ème
    } else if (normalizedScore >= 20) {
      calculatedRank = randomInRange(41, 75); // 41ème à 75ème
    } else {
      calculatedRank = randomInRange(76, simulatedParticipants); // Au-delà
    }

    setRank(calculatedRank);

  }, [score, totalQuestions]);
  
  if (rank === 0) return null;

  const getRankingMessage = () => {
      const percentageRank = (rank / totalParticipants) * 100;
      if (rank === 1) return "Félicitations ! Vous êtes premier ! 🏆";
      if (percentageRank <= 10) return "Dans le top 10% ! Excellent !";
      if (percentageRank <= 25) return "Dans le premier quart. Très bonne performance !";
      if (percentageRank <= 50) return "Dans la première moitié. Continuez vos efforts !";
      return "Continuez à vous entraîner pour améliorer votre classement.";
  };


  return (
      <Card className="glassmorphism shadow-xl">
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Users className="w-6 h-6 text-indigo-500"/>
                  Votre Classement
              </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
              <p className="text-4xl font-black">{rank}<span className="text-2xl font-bold text-muted-foreground">ème</span></p>
              <p className="text-muted-foreground">sur {totalParticipants} participants</p>
              <p className="font-semibold text-indigo-600 pt-2">{getRankingMessage()}</p>
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
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default
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
      if (quizSource === 'generated' || quizSource === 'quick-practice') {
          // Do not save attempt for dynamically generated quizzes as they have no persistent ID
        } else {
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

      let loadedQuizData: Quiz | null = null;

      try {
        if (sourceParam === 'generated' || sourceParam === 'quick-practice') {
          const quizDataString = sessionStorage.getItem('generatedQuiz');
          if (quizDataString) {
            loadedQuizData = JSON.parse(quizDataString) as Quiz;
          }
        } else if (quizIdParam) {
          const allQuizzes = await getQuizzesFromFirestore();
          loadedQuizData = allQuizzes.find(q => q.id === quizIdParam) || null;
        }

        if (loadedQuizData && loadedQuizData.questions && loadedQuizData.questions.length > 0) {
          const activeQuiz: ActiveQuiz = {
            id: loadedQuizData.id || `generated-${Date.now()}`,
            ...loadedQuizData,
          };
          setQuiz(activeQuiz);
          setUserAnswers(Array(activeQuiz.questions.length).fill([]));
          let duration = activeQuiz.duration_minutes || activeQuiz.questions.length; // 1 min per question fallback
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
      const currentAnswersForQuestion = newAnswers[currentQuestionIndex] || [];
      if (checked) {
        newAnswers[currentQuestionIndex] = [...currentAnswersForQuestion, option];
      } else {
        newAnswers[currentQuestionIndex] = currentAnswersForQuestion.filter(
          (ans) => ans !== option
        );
      }
      return newAnswers;
    });
  };

  if (loading || !quiz) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-screen">
          <Loader className="w-12 h-12 animate-spin text-purple-500" />
          <p className="font-medium text-muted-foreground">Chargement du quiz...</p>
      </div>
    );
  }
  
  if (!quiz.questions || quiz.questions.length === 0) {
     return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <Card className="glassmorphism shadow-xl">
          <CardHeader className="text-center">
             <XCircle className="w-16 h-16 mx-auto text-red-500" />
             <CardTitle className="text-3xl font-black gradient-text">Quiz Invalide</CardTitle>
             <CardDescription className="text-lg font-medium">Ce quiz ne contient aucune question.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/dashboard/quizzes')}>
                Retourner à la liste des quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const score = results.filter(r => r.isCorrect).length;

  if (quizFinished) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <Card className="glassmorphism shadow-xl">
          <CardHeader className="text-center">
            <Award className="w-16 h-16 mx-auto text-yellow-500" />
            <CardTitle className="text-3xl font-black gradient-text">Résultats du Quiz</CardTitle>
            <CardDescription className="text-lg font-medium">{quiz.title}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-5xl font-bold">
              {score} / {quiz.questions.length}
            </p>
            <Progress value={(score / quiz.questions.length) * 100} className="w-full max-w-sm mx-auto" />
             <Button onClick={() => router.push('/dashboard/quizzes')}>
                Retourner à la liste des quiz
            </Button>
          </CardContent>
        </Card>

        {quiz.isMockExam && <RankingCard score={score} totalQuestions={quiz.questions.length} />}

        <EncouragementCard score={score} total={quiz.questions.length} />
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Activity/>Correction détaillée</h2>
          {results.map((result, index) => (
            <Card key={index} className="glassmorphism shadow-lg">
              <CardContent className="p-6 space-y-3">
                <div className="font-bold">{index + 1}. <MathText text={result.question} /></div>
                <div className="space-y-2">
                  {result.options.map(option => {
                    const isSelected = result.selectedAnswers.includes(option);
                    const isCorrect = result.correctAnswers.includes(option);
                    
                    let itemClass = "bg-white/50 dark:bg-black/20";
                    if (isSelected && !isCorrect) itemClass = "bg-red-200/80 dark:bg-red-900/50";
                    if (isCorrect) itemClass = "bg-green-200/80 dark:bg-green-900/50";

                    return (
                      <div key={option} className={`flex items-center gap-3 text-sm p-2 rounded-md ${itemClass}`}>
                         {(isSelected && isCorrect) && <CheckCircle className="w-5 h-5 text-green-600" />}
                         {(isSelected && !isCorrect) && <XCircle className="w-5 h-5 text-red-600" />}
                         {(!isSelected && isCorrect) && <CheckCircle className="w-5 h-5 text-green-600 opacity-50" />}
                         {(!isSelected && !isCorrect) && <div className="w-5 h-5" /> /* Placeholder */}
                        
                        <span className="flex-1"><MathText text={option} /></span>
                      </div>
                    );
                  })}
                </div>
                {result.explanation && (
                  <div className="mt-2 p-3 text-sm rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <div><strong>Explication :</strong> <MathText text={result.explanation} /></div>
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
    <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-3xl glassmorphism shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-start mb-2 gap-4">
             <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className='flex-1 text-center'>
                <CardTitle className="text-xl font-bold gradient-text">{quiz.title}</CardTitle>
                <CardDescription>Question {currentQuestionIndex + 1} sur {quiz.questions.length}</CardDescription>
            </div>
            <div className="flex items-center gap-2 font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full text-sm shrink-0">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="w-full mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-lg font-semibold"><MathText text={currentQuestion.question} /></div>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                 <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-all">
                    <Checkbox 
                        id={`option-${index}`}
                        checked={selectedAnswersForCurrent.includes(option)}
                        onCheckedChange={(checked) => handleAnswerChange(option, !!checked)}
                    />
                    <Label htmlFor={`option-${index}`} className="font-medium flex-1 cursor-pointer">
                        <MathText text={option} />
                    </Label>
                 </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Cette question peut avoir une ou plusieurs bonnes réponses.
            </p>
            <div className="flex justify-between gap-4">
              <Button onClick={handlePreviousQuestion} variant="outline" disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button onClick={() => handleFinishQuiz()} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg">
                  Terminer le Quiz
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg">
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TakeQuizPage() {
    return (
        // Suspense boundary is required for useSearchParams to work
        <React.Suspense fallback={
            <div className="flex flex-col gap-4 justify-center items-center h-screen">
                <Loader className="w-12 h-12 animate-spin text-purple-500" />
                <p className="font-medium text-muted-foreground">Préparation du quiz...</p>
            </div>
        }>
            <TakeQuizComponent />
        </React.Suspense>
    )
}
