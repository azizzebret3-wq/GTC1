// src/components/admin/QuizAdminPanel.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ClipboardList, PlusCircle, Trash2, Edit, Loader, Save, ArrowLeft, BrainCircuit, X, Sparkles, CalendarClock, History, Clock, Layout
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
} from '@/lib/firestore.service';
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

const officialCategories = [
    'Actualités', 'Culture Générale', 'Mathématiques', 'SVT', 'Physique-Chimie', 'Français', 
    'Philosophie', 'Histoire', 'Géographie', 'Droit', 'Économie', 'Tests Psychotechniques', 
    'Concours Passés', 'Accompagnement Final', 'Mixte'
];

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
};

const MathToolbar = ({ onInsert }: { onInsert: (snippet: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-1 p-2 rounded-xl border bg-muted/30 mb-2">
      {Object.entries(latexSnippets).map(([key, value]) => (
        <Button
          key={key}
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-8 rounded-lg bg-background hover:bg-primary hover:text-white transition-all"
          onClick={() => onInsert(value)}
        >
          <MathText text={'$'+value.replace(/\{\}/g, '{•}')+'$'} />
        </Button>
      ))}
    </div>
  );
};

function AiGeneratorDialog({ open, onOpenChange, onGenerate, isGenerating }: { open: boolean, onOpenChange: (open: boolean) => void, onGenerate: (topic: string, num: number, diff: string) => void, isGenerating: boolean }) {
    const [topic, setTopic] = useState('');
    const [num, setNum] = useState('10');
    const [diff, setDiff] = useState('moyen');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black gradient-text">Intelligence Artificielle</DialogTitle>
                    <DialogDescription className="font-medium">Créez un quiz d'élite en quelques secondes.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="font-bold">Sujet de l'examen</Label>
                        <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: Droit Constitutionnel Burkinabè" className="rounded-xl h-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Questions</Label>
                            <Select value={num} onValueChange={setNum}>
                                <SelectTrigger className="rounded-xl h-12"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {['5','10','15','20','30'].map(v => <SelectItem key={v} value={v}>{v} questions</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">Difficulté</Label>
                            <Select value={diff} onValueChange={setDiff}>
                                <SelectTrigger className="rounded-xl h-12"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facile">Facile</SelectItem>
                                    <SelectItem value="moyen">Moyen</SelectItem>
                                    <SelectItem value="difficile">Difficile</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-12">Annuler</Button>
                    <Button onClick={() => onGenerate(topic, parseInt(num), diff)} disabled={isGenerating || !topic} className="rounded-xl h-12 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold">
                        {isGenerating ? <Loader className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                        Générer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function QuestionsForm({ qIndex, removeQuestion }: { qIndex: number, removeQuestion: (index: number) => void }) {
    const { control, register, watch, setValue, formState: { errors } } = useFormContext<QuizFormData>();
    const { fields: options, append: appendOption, remove: removeOption } = useFieldArray({ control, name: `questions.${qIndex}.options` });
    const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    const insertToTextarea = (field: "question" | "explanation", snippet: string) => {
        const textarea = activeTextareaRef.current;
        if (!textarea || !textarea.name.endsWith(field)) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        const newVal = val.substring(0, start) + snippet + val.substring(end);
        setValue(`questions.${qIndex}.${field}`, newVal, { shouldValidate: true });
        setTimeout(() => textarea.focus(), 0);
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-xl border">
                <h4 className="font-black text-primary uppercase tracking-widest text-xs">Question n°{qIndex + 1}</h4>
                <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-lg" onClick={() => removeQuestion(qIndex)}><Trash2 className="w-4 h-4"/></Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-bold">Énoncé de la question</Label>
                        <MathToolbar onInsert={(s) => insertToTextarea("question", s)} />
                        <Textarea 
                            {...register(`questions.${qIndex}.question`)} 
                            onFocus={e => activeTextareaRef.current = e.target} 
                            placeholder="Entrez votre question ici... Utilisez $ pour les maths."
                            className="rounded-xl min-h-[120px]" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold">Explication pédagogique</Label>
                        <Textarea 
                            {...register(`questions.${qIndex}.explanation`)} 
                            onFocus={e => activeTextareaRef.current = e.target} 
                            placeholder="Pourquoi cette réponse est-elle correcte ?"
                            className="rounded-xl min-h-[100px] text-sm" 
                        />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <Label className="font-bold">Aperçu du rendu final</Label>
                    <Card className="rounded-2xl border-2 border-dashed bg-muted/10 p-6 min-h-[260px] overflow-hidden">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div className="font-bold text-lg leading-relaxed mb-4">
                                <MathText text={watch(`questions.${qIndex}.question`) || '*La question s\'affichera ici...*'} />
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl border-l-4 border-indigo-500 text-xs">
                                <p className="font-black text-indigo-700 dark:text-indigo-400 uppercase mb-1">Expert :</p>
                                <MathText text={watch(`questions.${qIndex}.explanation`) || 'L\'explication détaillée apparaîtra après le quiz.'} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="space-y-4">
                <Label className="font-bold block">Options de réponse (Cochez les bonnes)</Label>
                <Controller
                    control={control}
                    name={`questions.${qIndex}.correctAnswers`}
                    render={({ field }) => (
                      <div className="grid md:grid-cols-2 gap-3">
                        {options.map((option, oIdx) => {
                          const val = watch(`questions.${qIndex}.options.${oIdx}.value`);
                          return (
                            <div key={option.id} className="flex items-center gap-3 p-2 rounded-xl border bg-background hover:border-primary transition-all">
                              <Checkbox
                                checked={field.value?.includes(val) && val !== ''}
                                onCheckedChange={(checked) => {
                                  if (!val) return;
                                  const cur = field.value || [];
                                  field.onChange(checked ? [...cur, val] : cur.filter(v => v !== val));
                                }}
                                disabled={!val}
                                className="h-5 w-5 rounded-md"
                              />
                              <Input {...register(`questions.${qIndex}.options.${oIdx}.value`)} placeholder={`Réponse ${oIdx + 1}`} className="border-none focus-visible:ring-0 shadow-none px-0 h-8 text-sm" />
                              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => removeOption(oIdx)}><X className="w-3 h-3"/></Button>
                            </div>
                          );
                        })}
                        <Button type="button" variant="outline" size="sm" className="h-12 rounded-xl border-dashed border-2 hover:bg-primary/5" onClick={() => appendOption({ value: '' })}>+ Ajouter une option</Button>
                      </div>
                    )}
                  />
            </div>
        </div>
    )
}

export default function QuizAdminPanel() {
  const { toast } = useToast();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const formMethods = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: { title: '', category: '', difficulty: 'moyen', access_type: 'gratuit', duration_minutes: 15, isMockExam: false, questions: [] },
  });
  
  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = await getQuizzesFromFirestore();
      setQuizzes(q.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Chargement impossible.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleOpenDialog = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      formMethods.reset({
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
      setEditingQuiz(null);
      formMethods.reset({ title: '', questions: [{ question: '', options: [{value:''},{value:''}], correctAnswers: [] }] });
    }
    setIsFormOpen(true);
  };

  const onFormSubmit = async (data: QuizFormData) => {
    const quizData: NewQuizData = {
      ...data,
      questions: data.questions.map(q => ({ ...q, options: q.options.map(o => o.value) })),
      total_questions: data.questions.length,
    };
    try {
      if (editingQuiz) await updateQuizInFirestore(editingQuiz.id!, quizData as Partial<Quiz>);
      else await saveQuizToFirestore(quizData);
      toast({ title: 'Succès', description: 'Le quiz a été enregistré avec succès.' });
      setIsFormOpen(false);
      fetchQuizzes();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Échec de la sauvegarde.' });
    }
  };

  const handleGenerateAi = async (topic: string, num: number, difficulty: string) => {
    setIsGenerating(true);
    try {
      // @ts-ignore
      const puter = window.puter;
      const prompt = `Tu es un expert concepteur de quiz pour les concours administratifs au Burkina Faso. 
      Génère un quiz de très haute qualité sur le sujet : "${topic}".
      Difficulté demandée : ${difficulty}. Nombre de questions : ${num}.
      
      RÈGLES STRICTES :
      1. FORMAT JSON VALIDE UNIQUEMENT.
      2. MATHS : Utilise impérativement le signe $ pour tout symbole, formule ou variable (ex: $x^2$, $U_n$).
      3. QUALITÉ : Les questions doivent tester l'analyse, pas seulement la mémoire.
      4. OPTIONS : Fournis 4 options crédibles par question.
      
      STRUCTURE JSON :
      {
        "title": "Titre engageant",
        "description": "Description concise du quiz",
        "category": "Choisir parmi: ${officialCategories.join(', ')}",
        "duration_minutes": ${num * 1.5},
        "questions": [
          {
            "question": "Énoncé de la question",
            "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"],
            "correctAnswers": ["La réponse exacte (doit être identique à l'une des options)"],
            "explanation": "Explication pédagogique riche et détaillée."
          }
        ]
      }`;

      const response = await puter.ai.chat(prompt, { model: 'google/gemini-1.5-pro' });
      const cleanJson = response.text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleanJson);

      formMethods.reset({
        ...formMethods.getValues(),
        title: result.title,
        description: result.description,
        category: result.category,
        duration_minutes: result.duration_minutes,
        questions: result.questions.map((q: any) => ({
            question: q.question,
            explanation: q.explanation,
            options: q.options.map((o: string) => ({ value: o })),
            correctAnswers: q.correctAnswers
        }))
      });
      setIsAiOpen(false);
      toast({ title: "Génération IA réussie", description: "Veuillez réviser le contenu avant d'enregistrer." });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur IA', description: 'Impossible de générer le contenu.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black gradient-text">Gestion des Quiz</h1>
              <p className="text-sm font-medium text-muted-foreground">Administrez les banques de questions.</p>
            </div>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} className="rounded-xl h-12 bg-primary font-bold shadow-lg">
          <PlusCircle className="mr-2 h-5 w-5"/>Nouveau Quiz
        </Button>
      </div>
      
      <Card className="glassmorphism shadow-2xl border-0 overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader className="w-12 h-12 animate-spin text-purple-600"/>
                <p className="font-bold text-muted-foreground animate-pulse">Chargement de la banque...</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                    <TableHead className="font-bold py-5 pl-8">Quiz</TableHead>
                    <TableHead className="font-bold">Matière</TableHead>
                    <TableHead className="font-bold">Difficulté</TableHead>
                    <TableHead className="font-bold">Accès</TableHead>
                    <TableHead className="text-right font-bold pr-8">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quizzes.map(q => (
                    <TableRow key={q.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="py-4 pl-8">
                            <div className="font-black text-slate-800 dark:text-slate-100">{q.title}</div>
                            <div className="text-xs text-muted-foreground">{q.total_questions} questions • {q.duration_minutes} min</div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="rounded-lg">{q.category}</Badge></TableCell>
                        <TableCell>
                            <Badge className={
                                q.difficulty === 'difficile' ? 'bg-red-500' : 
                                q.difficulty === 'moyen' ? 'bg-amber-500' : 'bg-green-500'
                            }>
                                {q.difficulty}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={q.access_type === 'premium' ? 'destructive' : 'secondary'} className="rounded-lg">
                                {q.access_type}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(q)} className="rounded-lg hover:text-blue-600"><Edit className="h-4 w-4"/></Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0 rounded-3xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex flex-row items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
                <Layout className="w-6 h-6 text-purple-400" />
                <div>
                    <DialogTitle className="text-xl font-black">Éditeur d'Excellence</DialogTitle>
                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Configuration du matériel pédagogique</p>
                </div>
             </div>
             <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10" onClick={() => setIsFormOpen(false)}><X className="w-5 h-5"/></Button>
          </DialogHeader>
          
          <FormProvider {...formMethods}>
             <div className="flex-1 overflow-hidden p-6 bg-slate-50/30 dark:bg-zinc-950/40">
                <form onSubmit={formMethods.handleSubmit(onFormSubmit)} className="h-full flex flex-col gap-6">
                   <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-8">
                        {/* Métadonnées */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 p-6 rounded-3xl border-0 shadow-sm space-y-4">
                                <h3 className="font-black text-sm uppercase text-muted-foreground flex items-center gap-2"><Layout className="w-4 h-4"/> Informations Générales</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Titre du Quiz</Label>
                                        <Input {...formMethods.register("title")} placeholder="Ex: Grand Concours SVT 2025" className="rounded-xl h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">Catégorie</Label>
                                        <Controller name="category" control={formMethods.control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Sélectionnez..."/></SelectTrigger>
                                                <SelectContent>{officialCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )}/>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="font-bold">Description</Label>
                                        <Input {...formMethods.register("description")} placeholder="Bref résumé des objectifs pédagogiques..." className="rounded-xl h-11" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 rounded-3xl border-0 shadow-sm space-y-4">
                                <h3 className="font-black text-sm uppercase text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4"/> Paramètres d'Accès</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase">Difficulté</Label>
                                            <Controller name="difficulty" control={formMethods.control} render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="rounded-lg h-9 text-xs"><SelectValue/></SelectTrigger>
                                                    <SelectContent><SelectItem value="facile">Facile</SelectItem><SelectItem value="moyen">Moyen</SelectItem><SelectItem value="difficile">Difficile</SelectItem></SelectContent>
                                                </Select>
                                            )}/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase">Durée (min)</Label>
                                            <Input type="number" {...formMethods.register("duration_minutes")} className="rounded-lg h-9 text-xs" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
                                        <Label className="text-sm font-bold">Accès Premium</Label>
                                        <Controller name="access_type" control={formMethods.control} render={({ field }) => (
                                            <Switch checked={field.value === 'premium'} onCheckedChange={(v) => field.onChange(v ? 'premium' : 'gratuit')} />
                                        )}/>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
                                        <Label className="text-sm font-bold">Concours Blanc</Label>
                                        <Controller name="isMockExam" control={formMethods.control} render={({ field }) => (
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        )}/>
                                    </div>
                                    {formMethods.watch('isMockExam') && (
                                        <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl animate-in slide-in-from-top-1">
                                            <Label className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400">Programmée pour le :</Label>
                                            <Controller name="scheduledFor" control={formMethods.control} render={({ field }) => (
                                                <Input type="datetime-local" value={formatDateForInput(field.value)} onChange={(e) => field.onChange(new Date(e.target.value))} className="rounded-lg h-9 text-xs border-amber-200" />
                                            )}/>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Questions */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 px-2 border-b">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-primary text-white font-black rounded-full h-8 w-8 flex items-center justify-center p-0">{formMethods.watch('questions').length}</Badge>
                                    <h3 className="font-black text-lg">Questions de l'épreuve</h3>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAiOpen(true)} className="rounded-xl h-10 border-purple-500 text-purple-600 hover:bg-purple-50"><BrainCircuit className="mr-2 h-4 w-4"/>Génération IA</Button>
                                    <Button type="button" size="sm" onClick={() => formMethods.setValue('questions', [...formMethods.getValues('questions'), { question: '', options: [{value:''},{value:''}], correctAnswers: [] }])} className="rounded-xl h-10 bg-primary text-white"><PlusCircle className="mr-2 h-4 w-4"/>Ajouter</Button>
                                </div>
                            </div>
                            
                            <div className="space-y-12 pb-10">
                                {formMethods.watch('questions').map((_, idx) => (
                                    <Card key={idx} className="p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <QuestionsForm qIndex={idx} removeQuestion={(i) => formMethods.setValue('questions', formMethods.getValues('questions').filter((_, q) => q !== i))} />
                                    </Card>
                                ))}
                            </div>
                        </div>
                      </div>
                   </ScrollArea>
                   
                   <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t shrink-0">
                      <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded-xl h-12 px-8 font-bold">Annuler</Button>
                      <Button type="submit" disabled={formMethods.formState.isSubmitting} className="rounded-xl h-12 px-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
                        {formMethods.formState.isSubmitting ? <Loader className="animate-spin mr-2"/> : <Save className="mr-2 h-5 w-5"/>}
                        Enregistrer l'examen complet
                      </Button>
                   </div>
                </form>
             </div>
          </FormProvider>
        </DialogContent>
      </Dialog>
      
      <AiGeneratorDialog open={isAiOpen} onOpenChange={setIsAiOpen} onGenerate={handleGenerateAi} isGenerating={isGenerating} />
    </div>
  );
}

