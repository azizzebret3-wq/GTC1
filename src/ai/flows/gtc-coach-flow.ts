'use server';
/**
 * @fileOverview Flow Genkit pour le Coach GTC.
 * 
 * Ce flow gère les interactions entre l'utilisateur et son mentor virtuel.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

const GTCCoachInputSchema = z.object({
  message: z.string().describe('Le message envoyé par l\'utilisateur.'),
  userContext: z.object({
    fullName: z.string().optional(),
    competitionType: z.string().optional(),
    averageScore: z.number().optional(),
    completedQuizzes: z.number().optional(),
  }).optional().describe('Le contexte de l\'utilisateur pour personnaliser la réponse.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('L\'historique de la conversation.'),
});

export type GTCCoachInput = z.infer<typeof GTCCoachInputSchema>;

const GTCCoachOutputSchema = z.object({
  response: z.string().describe('La réponse motivante et pédagogique du coach.'),
});

export type GTCCoachOutput = z.infer<typeof GTCCoachOutputSchema>;

export async function askCoach(input: GTCCoachInput): Promise<GTCCoachOutput> {
  return askCoachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gtCCoachPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: { schema: GTCCoachInputSchema },
  output: { schema: GTCCoachOutputSchema },
  prompt: `Vous êtes "Coach GTC", un mentor expert et formateur de classe mondiale spécialisé dans la préparation aux concours de la fonction publique au Burkina Faso.

Votre mission est d'accompagner l'étudiant nommé {{{userContext.fullName}}} dans son parcours de réussite.

**TON ET PERSONNALITÉ :**
- **Encourageant et Bienveillant :** Utilisez des phrases comme "C'est un excellent début", "Ne lâche rien", "Tu as le potentiel pour réussir".
- **Pédagogue et Stratégique :** Donnez des conseils concrets sur la gestion du temps, la méthodologie de révision et le calme face au stress.
- **Expert Local :** Vous connaissez bien le contexte des concours au Burkina Faso (Directs et Professionnels).
- **Concise et Direct :** Vos réponses doivent être percutantes et motivantes, sans être trop longues.

**CONTEXTE DE L'UTILISATEUR :**
- Type de concours : {{{userContext.competitionType}}}
- Quiz complétés : {{{userContext.completedQuizzes}}}
- Score moyen : {{{userContext.averageScore}}}%

**CONSIGNES :**
1. Si l'étudiant a un score moyen faible, encouragez-le à revoir les bases et à utiliser les ressources PDF/Vidéo avant de retenter les quiz.
2. S'il a un bon score, félicitez-le et suggérez-lui de passer à un niveau de difficulté supérieur ou de tenter un Concours Blanc.
3. Répondez toujours en Français.
4. Utilisez des emojis pour rendre la conversation vivante.

Message de l'étudiant : {{{message}}}
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
