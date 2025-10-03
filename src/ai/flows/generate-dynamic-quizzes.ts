'use server';
/**
 * @fileOverview A dynamic quiz generation AI agent.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numberOfQuestions: z.number().describe('The number of questions to generate for the quiz.'),
  difficulty: z.enum(['facile', 'moyen', 'difficile']).describe('The difficulty level for the quiz questions.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuestionSchema = z.object({
    question: z.string().describe('The question text.'),
    options: z.array(z.string()).describe('A list of possible answers.'),
    correctAnswers: z.array(z.string()).describe('A list of correct answers. Each string in this array must be an exact match to one of the strings in the `options` array.'),
    explanation: z.string().describe('A rich and detailed pedagogical explanation for the correct answer. Explain why the answer is correct and why other options are incorrect.'),
});

const QuizSchema = z.object({
    title: z.string().describe('A creative and engaging title for the quiz.'),
    description: z.string().describe('A brief description of the quiz.'),
    category: z.string().describe('The general category of the quiz (e.g., "Culture Générale", "Droit International", "Histoire Contemporaine").'),
    difficulty: z.enum(['facile', 'moyen', 'difficile']).describe('The difficulty level of the quiz.'),
    duration_minutes: z.number().describe('The estimated duration of the quiz in minutes.'),
    questions: z.array(QuestionSchema).describe('A list of questions for the quiz.'),
});

const GenerateQuizOutputSchema = z.object({
  quiz: QuizSchema,
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `Vous êtes un expert pédagogue et un concepteur de programmes d'examen de classe mondiale, spécialisé dans la création de matériel pour des concours de haut niveau au Burkina Faso.
Votre mission est de concevoir un quiz exceptionnel, pertinent et intellectuellement stimulant sur le sujet fourni.

Le quiz doit être entièrement en français et optimisé pour un apprentissage en profondeur.

Sujet du Quiz : {{{topic}}}
Difficulté demandée : {{{difficulty}}}

Veuillez générer un quiz complet en respectant scrupuleusement la structure et les exigences de qualité suivantes :

1.  **Métadonnées du Quiz :**
    -   **Titre :** Créatif, accrocheur et professionnel.
    -   **Description :** Concise mais informative, donnant un aperçu clair du contenu.
    -   **Catégorie :** Pertinente et large (ex: "Relations Internationales", "Sciences et Techniques", "Histoire du 20e siècle").
    -   **Difficulté :** Doit correspondre à la difficulté demandée ({{{difficulty}}}).
    -   **Durée :** Une durée estimée en minutes, réaliste pour le nombre et la complexité des questions (par ex., 1 à 2 minutes par question).

2.  **Contenu des Questions ({{{numberOfQuestions}}} questions) :**
    -   **Profondeur Intellectuelle :** Les questions doivent aller au-delà de la simple mémorisation. Elles doivent tester l'analyse, la synthèse, la comparaison et la capacité à appliquer des concepts. Formulez des questions qui nécessitent une réelle réflexion. Pour un niveau "difficile", n'hésitez pas à utiliser des études de cas, des analyses de citations ou des comparaisons de concepts.
    -   **Clarté et Précision :** Chaque question doit être formulée sans aucune ambiguïté.
    -   **Distracteurs Plausibles :** Les options de réponse incorrectes (distracteurs) doivent être intelligentes, basées sur des erreurs courantes, des concepts proches ou des informations trompeuses mais crédibles. Évitez les options farfelues.
    -   **Bonnes Réponses :** CRUCIAL : La ou les bonnes réponses doivent correspondre EXACTEMENT à l'une des chaînes de caractères fournies dans le tableau des options.
    -   **Explications Pédagogiques :** OBLIGATOIRE et DÉTAILLÉE. Pour chaque question, fournissez une explication riche. Expliquez non seulement pourquoi la ou les réponses sont correctes, mais aussi pourquoi les autres options sont incorrectes. Cette explication est la clé de la valeur ajoutée de l'apprentissage.

Assurez-vous que le niveau de complexité des questions soit bien aligné avec la difficulté ({{{difficulty}}}) demandée.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
