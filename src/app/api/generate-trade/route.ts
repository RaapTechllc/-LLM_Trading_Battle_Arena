import { NextRequest, NextResponse } from 'next/server'
import { generateTradeDecision, MODEL_MAP } from '@/lib/openrouter'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous'
  const { allowed, retryAfter } = rateLimit(ip)
  
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  try {
    const { modelName, asset, currentPrice } = await request.json()

    if (!modelName || !asset || !currentPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: modelName, asset, currentPrice' },
        { status: 400 }
      )
    }

    if (!MODEL_MAP[modelName]) {
      return NextResponse.json(
        { error: `Unknown model: ${modelName}` },
        { status: 400 }
      )
    }

    const decision = await generateTradeDecision(modelName, asset, currentPrice)

    return NextResponse.json({
      success: true,
      decision,
      model: modelName,
      asset,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Generate trade error:', error)
    
    const message = error instanceof Error ? error.message : 'Failed to generate trade'
    const isConfigError = message.includes('not configured')
    
    return NextResponse.json(
      { error: message, configError: isConfigError },
      { status: isConfigError ? 503 : 500 }
    )
  }
}
