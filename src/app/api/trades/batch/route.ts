import { NextRequest, NextResponse } from 'next/server'
import { generateTradeDecision, MODEL_MAP } from '@/lib/openrouter'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const { models, asset, currentPrice } = await request.json()

    if (!models?.length || !asset || !currentPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: models, asset, currentPrice' },
        { status: 400 }
      )
    }

    const validModels = models.filter((m: string) => MODEL_MAP[m])
    
    // Rate limit accounts for batch size
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    for (let i = 0; i < validModels.length; i++) {
      const { allowed, retryAfter } = rateLimit(ip)
      if (!allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', retryAfter },
          { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        )
      }
    }
    if (!validModels.length) {
      return NextResponse.json(
        { error: 'No valid models provided' },
        { status: 400 }
      )
    }

    const results = await Promise.allSettled(
      validModels.map(async (modelName: string) => {
        const decision = await generateTradeDecision(modelName, asset, currentPrice)
        return { model: modelName, decision, success: true }
      })
    )

    const formatted = results.map((r, i) => 
      r.status === 'fulfilled' 
        ? r.value 
        : { model: validModels[i], success: false, error: 'Generation failed' }
    )

    return NextResponse.json({
      results: formatted,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Batch trade error:', error)
    return NextResponse.json(
      { error: 'Failed to generate trades' },
      { status: 500 }
    )
  }
}
