'use server';

/**
 * @fileOverview An AI agent that provides product recommendations weighted by vendor performance.
 *
 * - getVendorPerformanceRecommendations - A function that generates product recommendations based on vendor performance.
 * - VendorPerformanceRecommendationsInput - The input type for the getVendorPerformanceRecommendations function.
 * - VendorPerformanceRecommendationsOutput - The return type for the getVendorPerformanceRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VendorPerformanceRecommendationsInputSchema = z.object({
  userId: z.string().describe('The ID of the user requesting recommendations.'),
  browsingHistory: z
    .string()
    .describe('The user browsing history as a comma separated list of product ids.'),
  purchaseHistory: z
    .string()
    .describe('The user purchase history as a comma separated list of product ids.'),
  numberOfRecommendations: z
    .number()
    .describe('The number of product recommendations to return.'),
});

export type VendorPerformanceRecommendationsInput = z.infer<
  typeof VendorPerformanceRecommendationsInputSchema
>;

const VendorPerformanceRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('An array of product IDs recommended for the user.'),
});

export type VendorPerformanceRecommendationsOutput = z.infer<
  typeof VendorPerformanceRecommendationsOutputSchema
>;

export async function getVendorPerformanceRecommendations(
  input: VendorPerformanceRecommendationsInput
): Promise<VendorPerformanceRecommendationsOutput> {
  return vendorPerformanceRecommendationsFlow(input);
}

const vendorPerformanceRecommendationsPrompt = ai.definePrompt({
  name: 'vendorPerformanceRecommendationsPrompt',
  input: {schema: VendorPerformanceRecommendationsInputSchema},
  output: {schema: VendorPerformanceRecommendationsOutputSchema},
  prompt: `You are an expert eCommerce product recommendation system.

  You will provide product recommendations to the user based on their browsing history, purchase history, and vendor performance.
  You will weight recommendations based on vendor performance, so that products from high-performing vendors are more likely to be recommended.

  User ID: {{{userId}}}
  Browsing History: {{{browsingHistory}}}
  Purchase History: {{{purchaseHistory}}}
  Number of Recommendations: {{{numberOfRecommendations}}}

  Recommendations:`,
});

const vendorPerformanceRecommendationsFlow = ai.defineFlow(
  {
    name: 'vendorPerformanceRecommendationsFlow',
    inputSchema: VendorPerformanceRecommendationsInputSchema,
    outputSchema: VendorPerformanceRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await vendorPerformanceRecommendationsPrompt(input);
    return output!;
  }
);
