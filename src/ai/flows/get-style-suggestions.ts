
'use server';
/**
 * @fileOverview An AI flow to generate styling suggestions for a product.
 *
 * - getStyleSuggestions - A function that suggests complementary products.
 * - GetStyleSuggestionsInput - The input type for the getStyleSuggestions function.
 * - GetStyleSuggestionsOutput - The return type for the getStyleSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetStyleSuggestionsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().describe('The category of the product.'),
  currentProductId: z.string().describe('The ID of the current product to exclude from suggestions.')
});
export type GetStyleSuggestionsInput = z.infer<typeof GetStyleSuggestionsInputSchema>;

const SuggestedProductSchema = z.object({
    productId: z.string().describe('The ID of the suggested product.'),
    reason: z.string().describe('A short reason why this product is a good combination.')
});

const GetStyleSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestedProductSchema).describe('A list of product suggestions to style with.'),
});
export type GetStyleSuggestionsOutput = z.infer<typeof GetStyleSuggestionsOutputSchema>;

export async function getStyleSuggestions(input: GetStyleSuggestionsInput): Promise<GetStyleSuggestionsOutput> {
  return getStyleSuggestionsFlow(input);
}

const getStyleSuggestionsFlow = ai.defineFlow(
  {
    name: 'getStyleSuggestionsFlow',
    inputSchema: GetStyleSuggestionsInputSchema,
  outputSchema: GetStyleSuggestionsOutputSchema,
  },
  async (input) => {
    // Data now comes from Supabase; this flow is stubbed to avoid using local mock data.
    console.warn('getStyleSuggestions: returning empty suggestions (no local dataset). Input:', input)
    return { suggestions: [] }
  }
);
