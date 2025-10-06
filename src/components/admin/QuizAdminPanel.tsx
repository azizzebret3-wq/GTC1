// src/components/admin/QuizAdminPanel.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ClipboardList, PlusCircle, Trash2, Edit, Loader, Save, ArrowLeft, BrainCircuit, X, Sparkles, Shuffle
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Quiz,
  getQuizzesFromFirestore,
  deleteQuizFromFirestore,
  saveQuizToFirestore,
  updateQuizInFirestore,
  NewQuizData,
  QuizQuestion,
} from '@/lib/firestore.service';
import { generateQuiz, GenerateQuizOutput } from '@/ai/flows/generate-dynamic-quizzes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import MathText from '@/components/math-text';
import { ScrollArea } from '@/components/ui/scroll-area';

const questionSchema = z.object({
  question: z.string().min(1, "La question est requise."),
  options: z.array(z.object({ value: z.string().min(1, "L'option ne peut pas être vide.") })).min(2, "Au moins deux options sont requises."),
  correctAnswers: z.array(z.string()).min(1, "Au moins une bonne réponse est requise."),
  explanation: z.string().optional(),
});

const quizFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  category: z.string().min(1, "La catégorie est requise."),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  access_type: z.enum(['gratuit', 'premium']),
  duration_minutes: z.coerce.number().min(1, "La durée doit être d'au moins 1 minute."),
  isMockExam: z.boolean(),
  scheduledFor: z.date().optional(),
  questions: z.array(questionSchema).min(1, "Un quiz doit avoir au moins une question."),
}).refine(data => !data.isMockExam || !!data.scheduledFor, {
  message: "Un concours blanc doit avoir une date de programmation.",
  path: ["scheduledFor"],
});

type QuizFormData = z.infer<typeof quizFormSchema>;

const formatDateForInput = (date?: Date): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};

const latexSnippets = {
  fraction: '\\frac{}{}',
  power: '^{}',
  index: '_{}',
  sqrt: '\\sqrt{}',
  sum: '\\sum_{k=1}^{n}',
  integral: '\\int_{a}^{b}',
  limit: '\\lim_{x \\to \\infty}',
  vector: '\\vec{}',
  alpha: '\\alpha',
  beta: '\\beta',
  theta: '\\theta',
};

type LatexSnippetKey = keyof typeof latexSnippets;

const MathToolbar = ({ onInsert }: { onInsert: (snippet: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-1 p-2 rounded-md border bg-background mb-2">
      {(Object.keys(latexSnippets) as LatexSnippetKey[]).map((key) => (
        <Button
          key={key}
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onInsert(latexSnippets[key])}
          aria-label={`Insérer ${key}`}
        >
          <MathText text={latexSnippets[key].replace(/\{\}/g, '{•}').replace(/\\vec/g, '\\vec{F}')} />
        </Button>
      ))}
    </div>
  );
};


function AiGeneratorDialog({ open, onOpenChange, onGenerate, isGenerating }: { open: boolean, onOpenChange: (open: boolean) => void, onGenerate: (topic: string, numQuestions: number, difficulty: 'facile' | 'moyen' | 'difficile') => void, isGenerating: boolean }) {
    const [topic, setTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState('10');
    const [difficulty, setDifficulty] = useState<'facile' | 'moyen' | 'difficile'>('moyen');

    const handleGenerate = () => {
        if (!topic) return;
        onGenerate(topic, parseInt(numQuestions), difficulty);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Générer un Quiz avec l'IA</DialogTitle>
                    <DialogDescription>
                        Entrez un sujet, le nombre de questions et la difficulté.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="ai-topic">Sujet du Quiz</Label>
                        <Input 
                            id="ai-topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: La révolution de 1983 au Burkina Faso"
                            disabled={isGenerating}
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ai-num-questions">Nombre de questions</Label>
                             <Select value={numQuestions} onValueChange={setNumQuestions} disabled={isGenerating}>
                                <SelectTrigger id="ai-num-questions">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 Questions</SelectItem>
                                    <SelectItem value="20">20 Questions</SelectItem>
                                    <SelectItem value="30">30 Questions</SelectItem>
                                    <SelectItem value="40">40 Questions</SelectItem>
                                    <SelectItem value="50">50 Questions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ai-difficulty">Difficulté</Label>
                            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)} disabled={isGenerating}>
                                <SelectTrigger id="ai-difficulty">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facile">Facile</SelectItem>
                                    <SelectItem value="moyen">Moyen</SelectItem>
                                    <SelectItem value="difficile">Difficile</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>Annuler</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating || !topic}>
                        {isGenerating ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        {isGenerating ? 'Génération...' : 'Générer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ShuffleDialog({ open, onOpenChange, onGenerate, isGenerating, allQuestions }: { open: boolean, onOpenChange: (open: boolean) => void, onGenerate: (numQuestions: number, categories: string[], difficulties: string[]) => void, isGenerating: boolean, allQuestions: QuizQuestion[] }) {
    const [numQuestions, setNumQuestions] = useState(10);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
    
    const availableCategories = [...new Set(allQuestions.map(q => (q as any).category).filter(Boolean))];
    const availableDifficulties = ['facile', 'moyen', 'difficile'];

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
    }
    const handleDifficultyToggle = (difficulty: string) => {
        setSelectedDifficulties(prev => prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, d]);
    }

    const handleGenerate = () => {
        onGenerate(numQuestions, selectedCategories, selectedDifficulties);
    }
    
    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mélanger depuis la banque</DialogTitle>
                    <DialogDescription>
                        Créez un quiz en piochant des questions existantes.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label>Nombre de questions</Label>
                        <Input type="number" value={numQuestions} onChange={e => setNumQuestions(Math.min(50, Number(e.target.value)))} max={50} />
                    </div>
                     <div className="space-y-2">
                        <Label>Catégories (optionnel)</Label>
                        <ScrollArea className="h-32 border rounded-md p-2">
                           <div className="space-y-2">
                            {availableCategories.map(cat => (
                                <div key={cat} className="flex items-center space-x-2">
                                    <Checkbox id={`cat-${cat}`} checked={selectedCategories.includes(cat)} onCheckedChange={() => handleCategoryToggle(cat)} />
                                    <Label htmlFor={`cat-${cat}`} className="font-normal">{cat}</Label>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                    </div>
                     <div className="space-y-2">
                        <Label>Difficultés (optionnel)</Label>
                        <div className="flex gap-2 flex-wrap">
                            {availableDifficulties.map(diff => (
                                <Button key={diff} variant={selectedDifficulties.includes(diff) ? 'default' : 'outline'} onClick={() => handleDifficultyToggle(diff)} className="capitalize">{diff}</Button>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                         {isGenerating ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Shuffle className="w-4 h-4 mr-2" />}
                        Générer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function QuestionsForm({ qIndex, removeQuestion }: { qIndex: number, removeQuestion: (index: number) => void }) {
    const { control, register, watch, setValue, formState: { errors } } = useFormContext<QuizFormData>();
    
    const { fields: options, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: `questions.${qIndex}.options`,
    });

    const questionOptions = watch(`questions.${qIndex}.options`);
    const correctAnswers = watch(`questions.${qIndex}.correctAnswers`) || [];

    const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    const insertToTextarea = (field: "question" | "explanation", snippet: string) => {
        const textarea = (activeTextareaRef.current?.name.endsWith(field)) ? activeTextareaRef.current : null;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = textarea.value;
        const newValue = currentValue.substring(0, start) + snippet + currentValue.substring(end);

        setValue(`questions.${qIndex}.${field}`, newValue, { shouldValidate: true, shouldDirty: true });
        
        setTimeout(() => {
            textarea.focus();
            const cursorPos = start + snippet.indexOf('{}');
            if (cursorPos > start) {
                textarea.setSelectionRange(cursorPos, cursorPos);
            } else {
                textarea.setSelectionRange(start + snippet.length, start + snippet.length);
            }
        }, 0);
    };

    const handleCorrectAnswerChange = (optionValue: string) => {
        if (!optionValue) return;
        const isChecked = correctAnswers.includes(optionValue);
        const newCorrectAnswers = isChecked
            ? correctAnswers.filter((a: string) => a !== optionValue)
            : [...correctAnswers, optionValue];
        setValue(`questions.${qIndex}.correctAnswers`, newCorrectAnswers, { shouldValidate: true, shouldDirty: true });
    };
    
    const questionErrors = errors.questions?.[qIndex];
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-bold">Question {qIndex + 1}</h4>
                <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeQuestion(qIndex)}>
                    <Trash2 className="w-4 h-4"/>
                </Button>
            </div>
            
            <div className="space-y-2">
                <Label>Texte de la question *</Label>
                <MathToolbar onInsert={(snippet) => insertToTextarea("question", snippet)} />
                <div className="grid md:grid-cols-2 gap-4">
                    <Textarea 
                        {...register(`questions.${qIndex}.question`)} 
                        onFocus={(e) => activeTextareaRef.current = e.target}
                        rows={6}
                    />
                    <div className="p-4 bg-background rounded-md border min-h-[140px]">
                        <Label className="text-sm text-muted-foreground">Aperçu</Label>
                        <div className="text-lg"><MathText text={watch(`questions.${qIndex}.question`) || ''} isBlock /></div>
                    </div>
                </div>
                {questionErrors?.question && <p className="text-red-500 text-xs mt-1">{questionErrors.question.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Explication (optionnel)</Label>
                <MathToolbar onInsert={(snippet) => insertToTextarea("explanation", snippet)} />
                <div className="grid md:grid-cols-2 gap-4">
                    <Textarea 
                        {...register(`questions.${qIndex}.explanation`)} 
                        onFocus={(e) => activeTextareaRef.current = e.target}
                        rows={6}
                    />
                    <div className="p-4 bg-background rounded-md border min-h-[140px]">
                        <Label className="text-sm text-muted-foreground">Aperçu</Label>
                        <div className="text-base"><MathText text={watch(`questions.${qIndex}.explanation`) || ''} isBlock /></div>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <Label>Options et Bonnes réponses *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ value: '' })}>Ajouter Option</Button>
                </div>
                 {questionErrors?.options?.root && <p className="text-red-500 text-xs mt-1">{questionErrors.options.root.message}</p>}
                 {questionErrors?.correctAnswers && <p className="text-red-500 text-xs mt-1">{questionErrors.correctAnswers.message}</p>}

                <div className="space-y-2 mt-1">
                    {options.map((option, optionIndex) => (
                        <div key={option.id} className="flex items-center gap-2">
                             <Checkbox
                                checked={correctAnswers.includes(questionOptions?.[optionIndex]?.value)}
                                onCheckedChange={() => handleCorrectAnswerChange(questionOptions?.[optionIndex]?.value)}
                                disabled={!questionOptions?.[optionIndex]?.value}
                             />
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <Input {...register(`questions.${qIndex}.options.${optionIndex}.value`)} placeholder={`Option ${optionIndex + 1}`} />
                                <div className="p-2 border rounded-md bg-background text-sm flex items-center">
                                    <MathText text={watch(`questions.${qIndex}.options.${optionIndex}.value`) || ''} />
                                </div>
                                {questionErrors?.options?.[optionIndex]?.value && <p className="text-red-500 text-xs mt-1 col-span-2">{questionErrors.options[optionIndex].value.message}</p>}
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeOption(optionIndex)}><X className="w-4 h-4"/></Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const QuizForm = ({ onFormSubmit, handleCloseDialog, handleOpenAiDialog, handleOpenShuffleDialog }: { onFormSubmit: (data: QuizFormData) => void, handleCloseDialog: () => void, handleOpenAiDialog: () => void, handleOpenShuffleDialog: () => void }) => {
    const { control, register, handleSubmit, watch, formState: { errors, isSubmitting } } = useFormContext<QuizFormData>();
    const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({ control, name: "questions" });
    const isMockExam = watch("isMockExam");
    
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="title">Titre *</Label>
                    <Input {...register("title")} id="title" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="description">Description *</Label>
                    <Input {...register("description")} id="description" />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Input {...register("category")} id="category"/>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label>Difficulté *</Label>
                    <Controller name="difficulty" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="facile">Facile</SelectItem><SelectItem value="moyen">Moyen</SelectItem><SelectItem value="difficile">Difficile</SelectItem></SelectContent>
                    </Select>
                    )}/>
                </div>
                <div className="space-y-1.5">
                    <Label>Accès *</Label>
                    <Controller name="access_type" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="gratuit">Gratuit</SelectItem><SelectItem value="premium">Premium</SelectItem></SelectContent>
                    </Select>
                    )}/>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="duration_minutes">Durée (minutes) *</Label>
                    <Input type="number" {...register("duration_minutes")} id="duration_minutes" />
                    {errors.duration_minutes && <p className="text-red-500 text-xs mt-1">{errors.duration_minutes.message}</p>}
                </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                <Controller name="isMockExam" control={control} render={({ field }) => <Switch id="isMockExam" checked={field.value} onCheckedChange={field.onChange} />}/>
                <Label htmlFor="isMockExam">Concours Blanc</Label>
                </div>
                {isMockExam && (
                <div className="mt-4 space-y-1.5">
                    <Label>Date de programmation</Label>
                    <Controller name="scheduledFor" control={control} render={({ field }) => (
                    <Input type="datetime-local" value={formatDateForInput(field.value)} onChange={(e) => field.onChange(new Date(e.target.value))}/>
                    )}/>
                    {errors.scheduledFor && <p className="text-red-500 text-xs mt-1">{errors.scheduledFor.message}</p>}
                </div>
                )}
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Questions</h3>
                    <div className="flex gap-2">
                         <Button type="button" variant="outline" size="sm" onClick={handleOpenShuffleDialog}>
                            <Shuffle className="w-4 h-4 mr-2"/> Mélanger
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={handleOpenAiDialog}>
                            <BrainCircuit className="w-4 h-4 mr-2"/> Générer (IA)
                        </Button>
                        <Button type="button" size="sm" onClick={() => appendQuestion({ question: '', options: [{ value: '' }, { value: '' }], correctAnswers: [], explanation: '' })}>
                            <PlusCircle className="w-4 h-4 mr-2"/> Ajouter
                        </Button>
                    </div>
                </div>
                {errors.questions?.root && <p className="text-red-500 text-sm">{errors.questions.root.message}</p>}
                
                <div className="space-y-6">
                {questions.map((question, qIndex) => (
                    <Card key={question.id} className="bg-muted/50 p-4">
                        <QuestionsForm qIndex={qIndex} removeQuestion={removeQuestion} />
                    </Card>
                ))}
                </div>
            </div>
            </div>
            
            <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader className="w-4 h-4 mr-2 animate-spin"/>Enregistrement...</> : <><Save className="w-4 h-4 mr-2"/>Enregistrer</>}
            </Button>
            </DialogFooter>
        </form>
    )
}

export default function QuizAdminPanel() {
  const { toast } = useToast();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizFormOpen, setIsQuizFormOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isShuffleOpen, setIsShuffleOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const formMethods = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      difficulty: 'moyen',
      access_type: 'gratuit',
      duration_minutes: 15,
      isMockExam: false,
      questions: [],
    },
  });
  
  const { reset } = formMethods;

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedQuizzes = await getQuizzesFromFirestore();
      setQuizzes(fetchedQuizzes);
      const allQs = fetchedQuizzes.flatMap(q => q.questions.map(question => ({...question, category: q.category, difficulty: q.difficulty})));
      setAllQuestions(allQs);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les quiz.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const resetForm = useCallback(() => {
    reset({
      title: '',
      description: '',
      category: '',
      difficulty: 'moyen',
      access_type: 'gratuit',
      duration_minutes: 15,
      isMockExam: false,
      scheduledFor: undefined,
      questions: [],
    });
    setEditingQuiz(null);
  }, [reset]);

  const handleOpenDialog = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      reset({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        access_type: quiz.access_type,
        duration_minutes: quiz.duration_minutes,
        isMockExam: quiz.isMockExam || false,
        scheduledFor: quiz.scheduledFor ? new Date(quiz.scheduledFor) : undefined,
        questions: (quiz.questions || []).map(q => ({
          question: q.question,
          options: q.options.map(opt => ({ value: opt })),
          correctAnswers: q.correctAnswers,
          explanation: q.explanation || '',
        })),
      });
    } else {
      resetForm();
    }
    setIsQuizFormOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsQuizFormOpen(false);
    resetForm();
  };

  const onFormSubmit = async (formData: QuizFormData) => {
    const quizData: NewQuizData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      access_type: formData.access_type,
      duration_minutes: formData.duration_minutes,
      isMockExam: formData.isMockExam,
      questions: formData.questions.map(q => ({
        question: q.question,
        options: q.options.map(opt => opt.value),
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
      })),
      total_questions: formData.questions.length,
    };

    if (formData.isMockExam && formData.scheduledFor) {
      quizData.scheduledFor = formData.scheduledFor;
    }

    try {
      if (editingQuiz) {
        await updateQuizInFirestore(editingQuiz.id!, quizData as Partial<Quiz>);
      } else {
        await saveQuizToFirestore(quizData);
      }
      
      toast({ title: 'Succès', description: `Le quiz a été ${editingQuiz ? 'mis à jour' : 'enregistré'}.` });
      
      handleCloseDialog();
      fetchQuizzes();

    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur d\'enregistrement',
        description: 'Une erreur est survenue lors de la sauvegarde du quiz.',
      });
    }
  };
  
  const handleDeleteQuiz = async (id: string) => {
    try {
      await deleteQuizFromFirestore(id);
      toast({ title: 'Succès', description: 'Le quiz a été supprimé.' });
      fetchQuizzes();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le quiz.' });
    }
  };

  const handleGenerateQuiz = async (topic: string, numQuestions: number, difficulty: 'facile' | 'moyen' | 'difficile') => {
    setIsGenerating(true);
    try {
      const result: GenerateQuizOutput = await generateQuiz({ topic, numberOfQuestions: numQuestions, difficulty });
      const { quiz } = result;

      reset({
        ...formMethods.getValues(),
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        duration_minutes: quiz.duration_minutes,
        questions: (quiz.questions || []).map(q => ({
            question: q.question,
            options: q.options.map(opt => ({ value: opt })),
            correctAnswers: q.correctAnswers,
            explanation: q.explanation || '',
        })),
      });
      
      toast({ title: "Quiz généré !", description: `Un quiz sur "${topic}" a été créé. Veuillez le vérifier avant de l'enregistrer.`});
      setIsAiGeneratorOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur de génération', description: "L'IA n'a pas pu générer le quiz." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShuffleFromBank = (numQuestions: number, categories: string[], difficulties: string[]) => {
      setIsGenerating(true);
      let filteredQuestions = allQuestions;

      if(categories.length > 0) {
          filteredQuestions = filteredQuestions.filter(q => categories.includes((q as any).category));
      }
      if(difficulties.length > 0) {
          filteredQuestions = filteredQuestions.filter(q => difficulties.includes((q as any).difficulty));
      }

      if(filteredQuestions.length < numQuestions) {
          toast({ variant: 'destructive', title: 'Pas assez de questions', description: `Seulement ${filteredQuestions.length} questions correspondent à vos critères.` });
          setIsGenerating(false);
          return;
      }
      
      const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, numQuestions);

      reset({
          ...formMethods.getValues(),
          title: `Quiz Mélangé (${new Date().toLocaleDateString()})`,
          description: `Un quiz de ${numQuestions} questions sur ${categories.join(', ')}`,
          category: 'Mixte',
          difficulty: 'moyen',
          questions: selectedQuestions.map(q => ({
              question: q.question,
              options: q.options.map(opt => ({ value: opt })),
              correctAnswers: q.correctAnswers,
              explanation: q.explanation || '',
          })),
      });
      
      toast({ title: "Quiz mélangé !", description: `${numQuestions} questions ont été ajoutées au formulaire.`});
      setIsShuffleOpen(false);
      setIsGenerating(false);
  }
  
  return (
    <>
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black gradient-text">Gérer les Quiz</h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium">Créez, modifiez ou supprimez des quiz.</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-lg">
          <PlusCircle className="w-4 h-4 mr-2"/>
          Nouveau Quiz
        </Button>
      </div>
      
      <Card className="glassmorphism shadow-xl">
        <CardHeader>
          <CardTitle>Liste des quiz</CardTitle>
          <CardDescription>{quizzes.length} quiz disponibles.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader className="w-10 h-10 animate-spin text-purple-500"/></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Accès</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.category}</TableCell>
                    <TableCell>{quiz.total_questions}</TableCell>
                    <TableCell><Badge variant={quiz.access_type === 'premium' ? 'destructive' : 'default'}>{quiz.access_type}</Badge></TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(quiz)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id!)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isQuizFormOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Modifier le Quiz' : 'Créer un nouveau Quiz'}</DialogTitle>
            <DialogDescription>Remplissez les détails ci-dessous. Les champs marqués d'un * sont obligatoires.</DialogDescription>
          </DialogHeader>
          <FormProvider {...formMethods}>
            <QuizForm 
                onFormSubmit={onFormSubmit}
                handleCloseDialog={handleCloseDialog}
                handleOpenAiDialog={() => setIsAiGeneratorOpen(true)}
                handleOpenShuffleDialog={() => setIsShuffleOpen(true)}
            />
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
    <AiGeneratorDialog open={isAiGeneratorOpen} onOpenChange={setIsAiGeneratorOpen} onGenerate={handleGenerateQuiz} isGenerating={isGenerating} />
    <ShuffleDialog open={isShuffleOpen} onOpenChange={setIsShuffleOpen} onGenerate={handleShuffleFromBank} isGenerating={isGenerating} allQuestions={allQuestions} />
    </>
  );
}
