'use server';
/**
 * @fileOverview Flow Genkit d'élite pour le Coach Intégrale.
 * Utilise Gemini 1.5 Pro pour un raisonnement de niveau expert mondial.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

const GTCCoachInputSchema = z.object({
  message: z.string().describe('Le message de l\'étudiant.'),
  userContext: z.object({
    fullName: z.string().optional(),
    competitionType: z.string().optional(),
    averageScore: z.number().optional(),
    completedQuizzes: z.number().optional(),
    level: z.number().optional(),
    xp: z.number().optional(),
  }).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
});

export type GTCCoachInput = z.infer<typeof GTCCoachInputSchema>;

const GTCCoachOutputSchema = z.object({
  response: z.string().describe('Réponse stratégique et motivante.'),
});

export type GTCCoachOutput = z.infer<typeof GTCCoachOutputSchema>;

export async function askCoach(input: GTCCoachInput): Promise<GTCCoachOutput> {
  return askCoachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gtCCoachPrompt',
  model: googleAI.model('gemini-1.5-pro'),
  input: { schema: GTCCoachInputSchema },
  output: { schema: GTCCoachOutputSchema },
  prompt: `Tu es "Coach Intégrale", le mentor n°1 pour la réussite aux concours d'État au Burkina Faso chez Intégrale Formation. 
Ton niveau d'expertise est comparable aux meilleurs consultants en stratégie.

CONTEXTE DE L'ÉTUDIANT :
- Nom : {{{userContext.fullName}}}
- Niveau de Prestige : {{{userContext.level}}} / 5
- Score moyen : {{{userContext.averageScore}}}%
- Concours visé : {{{userContext.competitionType}}}

DIRECTIVES DE RÉPONSE :
1. **Analyse de Performance** : Si ses scores sont bas, propose un plan de révision strict. S'ils sont hauts, challenge-le sur la rapidité.
2. **Expertise Locale** : Tu connais parfaitement les réalités des concours (ENA, ENSEP, Police, Santé, etc.) au Burkina.
3. **Style** : Professionnel, charismatique, jamais infantilisant. Tu parles à un futur cadre de la nation.
4. **Action** : Termine souvent par une question qui le pousse à agir ou à réviser une matière spécifique.

HISTORIQUE :
{{#each history}}
- {{role}}: {{content}}
{{/each}}

MESSAGE : {{{message}}}
`,
});

const askCoachFlow = ai.defineFlow(
  {
    name: 'askCoachFlow',
    inputSchema: GTCCoachInputSchema,
    outputSchema: GTCCoachOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
