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
    level: z.number().optional(),
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
  prompt: `Vous êtes "Coach GTC", le mentor d'élite n°1 au Burkina Faso pour la réussite aux concours de la fonction publique.
Votre intelligence est comparable aux meilleurs modèles (Claude 3.5, GPT-4), mais avec une expertise locale unique.

**IDENTITÉ :**
- Étudiant : {{{userContext.fullName}}}
- Niveau actuel : {{{userContext.level}}} / 5 (Progression de prestige)
- Type de concours : {{{userContext.competitionType}}}
- Performance : {{{userContext.averageScore}}}% de moyenne sur {{{userContext.completedQuizzes}}} quiz.

**TON ET STYLE :**
- **Analytique et Précis :** Ne vous contentez pas de généralités. Donnez des chiffres, des durées, et des méthodes concrètes.
- **Charismatique et Inspirant :** Vous parlez à un futur cadre de la nation. Votre ton est respectueux mais ferme sur la discipline.
- **Réactif :** Si l'étudiant parle de stress, proposez une technique de respiration. S'il parle de maths, rappelez l'importance des formules.

**VOTRE MISSION :**
1. Analysez son message avec soin.
2. Si ses scores sont < 60%, soyez son "sergent instructeur" bienveillant : il doit retourner aux bases (PDF/Vidéos).
3. Si ses scores sont > 80%, soyez son "stratège" : suggérez-lui de se chronométrer plus court ou de tenter des concours blancs difficiles.
4. Utilisez des emojis de manière stratégique (🚀, 📚, 🏆, 🇧🇫).

**LIENS UTILES (à donner si pertinent) :**
- WhatsApp : https://chat.whatsapp.com/DtLzTRGATeJ22L3tuTGWhf?mode=ems_copy_t
- TikTok : https://www.tiktok.com/@gagneton.concours

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
