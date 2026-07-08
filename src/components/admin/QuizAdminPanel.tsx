// src/components/admin/QuizAdminPanel.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ClipboardList, PlusCircle, Trash2, Edit, Loader, Save, ArrowLeft, BrainCircuit, X, Sparkles, Shuffle, FileJson
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
    <div className="flex flex-wrap gap-1 p-2 rounded-md border bg-background mb-2">
      {Object.entries(latexSnippets).map(([key, value]) => (
        <Button
          key={key}
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Générer avec l'IA (Puter)</DialogTitle>
                    <DialogDescription>Créez un quiz de haute qualité sur n'importe quel sujet.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Sujet du Quiz</Label>
                        <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: Histoire du Burkina Faso" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Questions</Label>
                            <Select value={num} onValueChange={setNum}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {['5','10','15','20'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulté</Label>
                            <Select value={diff} onValueChange={setDiff}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button onClick={() => onGenerate(topic, parseInt(num), diff)} disabled={isGenerating || !topic}>
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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-primary">Question {qIndex + 1}</h4>
                <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeQuestion(qIndex)}><Trash2 className="w-4 h-4"/></Button>
            </div>
            <div className="space-y-2">
                <Label>Texte de la question</Label>
                <MathToolbar onInsert={(s) => insertToTextarea("question", s)} />
                <div className="grid md:grid-cols-2 gap-4">
                    <Textarea {...register(`questions.${qIndex}.question`)} onFocus={e => activeTextareaRef.current = e.target} rows={4} />
                    <div className="p-4 bg-background rounded-md border min-h-[100px]"><MathText text={watch(`questions.${qIndex}.question`) || ''} /></div>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Explication</Label>
                <div className="grid md:grid-cols-2 gap-4">
                    <Textarea {...register(`questions.${qIndex}.explanation`)} onFocus={e => activeTextareaRef.current = e.target} rows={3} />
                    <div className="p-4 bg-background rounded-md border min-h-[80px] text-sm"><MathText text={watch(`questions.${qIndex}.explanation`) || ''} /></div>
                </div>
            </div>
            <div>
                <Label className="mb-2 block">Options (Cochez la/les bonne(s) réponse(s))</Label>
                <div className="space-y-2">
                    <Controller
                        control={control}
                        name={`questions.${qIndex}.correctAnswers`}
                        render={({ field }) => (
                          <div className="space-y-2">
                            {options.map((option, oIdx) => {
                              const val = watch(`questions.${qIndex}.options.${oIdx}.value`);
                              return (
                                <div key={option.id} className="flex items-center gap-2">
                                  <Checkbox
                                    checked={field.value?.includes(val)}
                                    onCheckedChange={(checked) => {
                                      if (!val) return;
                                      const cur = field.value || [];
                                      field.onChange(checked ? [...cur, val] : cur.filter(v => v !== val));
                                    }}
                                    disabled={!val}
                                  />
                                  <Input {...register(`questions.${qIndex}.options.${oIdx}.value`)} placeholder={`Option ${oIdx + 1}`} />
                                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(oIdx)}><X className="w-3 h-3"/></Button>
                                </div>
                              );
                            })}
                            <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={() => appendOption({ value: '' })}>+ Ajouter une option</Button>
                          </div>
                        )}
                      />
                </div>
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
      setQuizzes(q);
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
      toast({ title: 'Succès', description: 'Quiz enregistré.' });
      setIsFormOpen(false);
      fetchQuizzes();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Sauvegarde échouée.' });
    }
  };

  const handleGenerateAi = async (topic: string, num: number, difficulty: string) => {
    setIsGenerating(true);
    try {
      // @ts-ignore
      const puter = window.puter;
      const prompt = `Génère un quiz de haute qualité en français sur le sujet : "${topic}".
      Difficulté : ${difficulty}. Nombre de questions : ${num}.
      FORMAT JSON STRICT :
      {
        "title": "Titre du quiz",
        "description": "Description concise",
        "category": "Catégorie appropriée",
        "duration_minutes": ${num * 1.5},
        "questions": [
          {
            "question": "Texte question (utilise $ pour math)",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswers": ["Option exacte"],
            "explanation": "Explication pédagogique détaillée"
          }
        ]
      }
      RÈGLE : Les questions doivent être complexes, pas de simple mémoire.`;

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
      toast({ title: "Génération réussie", description: "Vérifiez le contenu avant d'enregistrer." });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erreur IA', description: 'Génération échouée.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black gradient-text">Gérer les Quiz</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-primary"><PlusCircle className="mr-2 h-4 w-4"/>Nouveau</Button>
      </div>
      
      <Card className="glassmorphism">
        <CardContent className="pt-6">
          {isLoading ? <div className="flex justify-center p-12"><Loader className="animate-spin"/></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Titre</TableHead><TableHead>Catégorie</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {quizzes.map(q => (
                  <TableRow key={q.id}>
                    <TableCell className="font-bold">{q.title}</TableCell>
                    <TableCell><Badge variant="outline">{q.category}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(q)}><Edit className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Éditeur de Quiz</DialogTitle>
          </DialogHeader>
          <FormProvider {...formMethods}>
             <div className="flex-1 overflow-hidden p-6 pt-2">
                <form onSubmit={formMethods.handleSubmit(onFormSubmit)} className="h-full flex flex-col gap-4">
                   <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-6">
                        <Card className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Titre</Label><Input {...formMethods.register("title")} /></div>
                            <div className="space-y-2"><Label>Catégorie</Label>
                                <Controller name="category" control={formMethods.control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Catégorie..."/></SelectTrigger>
                                        <SelectContent>{officialCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                )}/>
                            </div>
                        </Card>
                        <div className="flex justify-between items-center sticky top-0 bg-background z-10 py-2">
                            <h3 className="font-bold">Questions ({formMethods.watch('questions').length})</h3>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsAiOpen(true)}><BrainCircuit className="mr-2 h-4 w-4"/>Générer IA</Button>
                        </div>
                        {formMethods.watch('questions').map((_, idx) => (
                            <Card key={idx} className="p-4 bg-muted/30">
                                <QuestionsForm qIndex={idx} removeQuestion={(i) => formMethods.setValue('questions', formMethods.getValues('questions').filter((_, q) => q !== i))} />
                            </Card>
                        ))}
                      </div>
                   </ScrollArea>
                   <DialogFooter className="pt-4 border-t">
                      <Button type="submit" disabled={formMethods.formState.isSubmitting} className="w-full sm:w-auto">
                        {formMethods.formState.isSubmitting ? <Loader className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4"/>}
                        Enregistrer le Quiz
                      </Button>
                   </DialogFooter>
                </form>
             </div>
          </FormProvider>
        </DialogContent>
      </Dialog>
      <AiGeneratorDialog open={isAiOpen} onOpenChange={setIsAiOpen} onGenerate={handleGenerateAi} isGenerating={isGenerating} />
    </div>
  );
}
