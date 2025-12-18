import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Database } from '@/lib/database.types'

type ProductId = Database['public']['Tables']['products']['Row']['id']
type ProductChatPayload = {
  productId?: ProductId
  productName?: string
  productDescription?: string
  productPrice?: number
  sizes?: string[]
  colors?: string[]
  message?: string
}

export async function POST(request: Request) {
  try {
    const { productId, productName, productDescription, productPrice, sizes, colors, message } =
      (await request.json()) as ProductChatPayload

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    let product = null
    if (productId) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .match({ id: productId as ProductId })
        .maybeSingle()
      if (!error) product = data
    }

    const productContext = product ?? {
      name: productName,
      description: productDescription,
      price: productPrice,
      sizes,
      colors,
    }

    const prompt = [
      {
        role: 'system' as const,
        content:
          'You are a concise, helpful shopping assistant. Answer questions about the product using only the provided product data. If you are unsure, say you do not have that detail.',
      },
      {
        role: 'user' as const,
        content: `Product details:\n${JSON.stringify(productContext, null, 2)}\nUser question: ${message}`,
      },
    ]

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 })
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: prompt,
        temperature: 0.4,
      }),
    })

    if (!openaiResponse.ok) {
      const text = await openaiResponse.text()
      console.error('OpenAI API error', openaiResponse.status, text)
      return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
    }

    const completion = (await openaiResponse.json()) as any
    const reply = completion.choices?.[0]?.message?.content ?? 'Sorry, I could not craft a response.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Product chat error', error)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
