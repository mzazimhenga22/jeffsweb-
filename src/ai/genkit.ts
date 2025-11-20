import { genkit } from 'genkit'
import { openai } from '@genkit-ai/openai'

const openAiApiKey = process.env.OPENAI_API_KEY

export const ai = genkit({
  plugins: [
    openai({
      apiKey: openAiApiKey,
    }),
  ],
  model: process.env.OPENAI_MODEL ?? 'openai/gpt-4o-mini',
})
