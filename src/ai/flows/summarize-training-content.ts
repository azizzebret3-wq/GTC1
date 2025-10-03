// Summarize Training Content Flow
'use server';
/**
 * @fileOverview A training content summarization AI agent.
 *
 * - summarizeTrainingContent - A function that handles the summarization process.
 * - SummarizeTrainingContentInput - The input type for the summarizeTrainingContent function
 * - SummarizeTrainingContentOutput - The return type for the summarizeTrainingContent function
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const SummarizeTrainingContentInputSchema = z.object({
  documentUrl: z.string().describe('The URL of the training document to be summarized.'),
});
export type SummarizeTrainingContentInput = z.infer<typeof SummarizeTrainingContentInputSchema>;

const SummarizeTrainingContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the training content.'),
});
export type SummarizeTrainingContentOutput = z.infer<typeof SummarizeTrainingContentOutputSchema>;

export async function summarizeTrainingContent(input: SummarizeTrainingContentInput): Promise<SummarizeTrainingContentOutput> {
  return summarizeTrainingContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTrainingContentPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {schema: SummarizeTrainingContentInputSchema},
  output: {schema: SummarizeTrainingContentOutputSchema},
  prompt: `You are an expert summarizer, able to distill complex information into its key points.

You will be given a URL to a document. While you can't access the URL directly, assume you have read the document.

Based on the document's presumed content at the URL {{{documentUrl}}}, generate a concise and insightful summary of its key points. The summary should be written in French.
`,
});

const summarizeTrainingContentFlow = ai.defineFlow(
  {
    name: 'summarizeTrainingContentFlow',
    inputSchema: SummarizeTrainingContentInputSchema,
    outputSchema: SummarizeTrainingContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
