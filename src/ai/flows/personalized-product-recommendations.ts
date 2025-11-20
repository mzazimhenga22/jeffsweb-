'use server';
/**
 * @fileOverview AI-powered product recommendation flow.
 *
 * - personalizedProductRecommendations - A function that generates personalized product recommendations.
 * - PersonalizedProductRecommendationsInput - The input type for the personalizedProductRecommendations function.
 * - PersonalizedProductRecommendationsOutput - The return type for the personalizedProductRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { enforceOpenAiRateLimit } from '@/ai/rate-limit';

const PersonalizedProductRecommendationsInputSchema = z.object({
  browsingHistory: z.string().describe('The user\'s browsing history.'),
  purchaseHistory: z.string().describe('The user\'s purchase history.'),
  vendorPerformance: z.string().describe('The vendor performance data.'),
});
export type PersonalizedProductRecommendationsInput = z.infer<typeof PersonalizedProductRecommendationsInputSchema>;

const PersonalizedProductRecommendationsOutputSchema = z.object({
  productRecommendations: z.string().describe('A list of personalized product recommendations.'),
});
export type PersonalizedProductRecommendationsOutput = z.infer<typeof PersonalizedProductRecommendationsOutputSchema>;

export async function personalizedProductRecommendations(input: PersonalizedProductRecommendationsInput): Promise<PersonalizedProductRecommendationsOutput> {
  return personalizedProductRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedProductRecommendationsPrompt',
  input: {schema: PersonalizedProductRecommendationsInputSchema},
  output: {schema: PersonalizedProductRecommendationsOutputSchema},
  prompt: `You are an AI assistant specializing in generating personalized product recommendations for e-commerce users.

  Based on the user's browsing history, purchase behavior, and vendor performance, provide a list of product recommendations that the user might be interested in.

  Browsing History: {{{browsingHistory}}}
  Purchase History: {{{purchaseHistory}}}
  Vendor Performance: {{{vendorPerformance}}}
  `,
});

const personalizedProductRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedProductRecommendationsFlow',
    inputSchema: PersonalizedProductRecommendationsInputSchema,
    outputSchema: PersonalizedProductRecommendationsOutputSchema,
  },
  async input => {
    try {
      enforceOpenAiRateLimit('personalizedProductRecommendations');
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      if ((error as any)?.code === 'rate_limit_exceeded') {
        console.warn('OpenAI rate limit reached, returning empty recommendations.');
        return { productRecommendations: '' };
      }
      throw error;
    }
  }
);
