'use server';
/**
 * @fileOverview An AI flow to generate a captivating product story.
 *
 * - generateProductStory - A function that creates a short marketing story for a product.
 * - GenerateProductStoryInput - The input type for the generateProductStory function.
 * - GenerateProductStoryOutput - The return type for the generateProductStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { enforceOpenAiRateLimit } from '@/ai/rate-limit';

const GenerateProductStoryInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().describe('The category of the product.'),
  productDescription: z.string().describe('The default description of the product.')
});
export type GenerateProductStoryInput = z.infer<typeof GenerateProductStoryInputSchema>;

const GenerateProductStoryOutputSchema = z.object({
  productStory: z.string().describe('A short, captivating marketing story for the product. Should be one sentence.'),
});
export type GenerateProductStoryOutput = z.infer<typeof GenerateProductStoryOutputSchema>;

export async function generateProductStory(input: GenerateProductStoryInput): Promise<GenerateProductStoryOutput> {
  return generateProductStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductStoryPrompt',
  input: {schema: GenerateProductStoryInputSchema},
  output: {schema: GenerateProductStoryOutputSchema},
  prompt: `You are an expert marketing copywriter for a luxury e-commerce brand.
  
  Your task is to write a single, compelling, and evocative sentence for a product.
  This sentence will be displayed on the hero banner of the website.
  
  Product Name: {{{productName}}}
  Category: {{{productCategory}}}
  
  Generate a story that is elegant, aspirational, and concise.
  `,
});

const generateProductStoryFlow = ai.defineFlow(
  {
    name: 'generateProductStoryFlow',
    inputSchema: GenerateProductStoryInputSchema,
    outputSchema: GenerateProductStoryOutputSchema,
  },
  async input => {
    try {
      enforceOpenAiRateLimit('generateProductStory');
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error('Error generating product story:', error);
      // Fallback to the original description if AI fails
      return { productStory: input.productDescription };
    }
  }
);
