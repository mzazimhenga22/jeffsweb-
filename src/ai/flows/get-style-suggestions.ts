
'use server';
/**
 * @fileOverview An AI flow to generate styling suggestions for a product.
 *
 * - getStyleSuggestions - A function that suggests complementary products.
 * - GetStyleSuggestionsInput - The input type for the getStyleSuggestions function.
 * - GetStyleSuggestionsOutput - The return type for the getStyleSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { products } from '@/lib/data';

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

const allProducts = products.map(p => ({id: p.id, name: p.name, category: p.category})).filter(p => p.id !== input.currentProductId);

const prompt = ai.definePrompt({
  name: 'getStyleSuggestionsPrompt',
  input: {schema: GetStyleSuggestionsInputSchema},
  output: {schema: GetStyleSuggestionsOutputSchema},
  prompt: `You are an expert fashion stylist for a luxury e-commerce brand.

  Your task is to suggest 2-3 products that would complement the given product to create a stylish outfit.
  
  Current Product Name: {{{productName}}}
  Current Product Category: {{{productCategory}}}
  
  Here is a list of available products with their ID, name, and category:
  ${JSON.stringify(allProducts)}
  
  Suggest products from the list above. Provide a short, compelling reason for each suggestion.
  Do not suggest the product itself.
  `,
});

const getStyleSuggestionsFlow = ai.defineFlow(
  {
    name: 'getStyleSuggestionsFlow',
    inputSchema: GetStyleSuggestionsInputSchema,
    outputSchema: GetStyleSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
