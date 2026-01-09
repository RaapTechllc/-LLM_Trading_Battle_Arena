import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      modelName,
      asset,
      direction,
      entryPrice,
      exitPrice,
      leverage,
      pnlPercent,
      pnlUsd,
      holdingHours,
      rarity,
      reasoning
    } = body

    // Validate required fields
    if (!modelName || !asset || !direction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate numeric fields (pnlPercent/pnlUsd can be negative for losses)
    const positiveFields = { entryPrice, exitPrice, leverage, holdingHours }
    for (const [key, value] of Object.entries(positiveFields)) {
      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json(
          { error: `Invalid ${key}: must be a positive number` },
          { status: 400 }
        )
      }
    }
    if (!Number.isFinite(pnlPercent) || !Number.isFinite(pnlUsd)) {
      return NextResponse.json(
        { error: 'Invalid pnlPercent or pnlUsd: must be a number' },
        { status: 400 }
      )
    }

    // Sanitize reasoning field
    const sanitizedReasoning = reasoning ? 
      reasoning.trim().substring(0, 200).replace(/<[^>]*>/g, '') : null

    // Find the trading model
    const model = await prisma.tradingModel.findUnique({
      where: { name: modelName }
    })

    if (!model) {
      return NextResponse.json(
        { error: 'Trading model not found' },
        { status: 404 }
      )
    }

    // Create the trade card
    const tradeCard = await prisma.tradeCard.create({
      data: {
        modelId: model.id,
        asset,
        direction,
        entryPrice,
        exitPrice,
        leverage,
        pnlPercent,
        pnlUsd,
        holdingHours,
        rarity,
        reasoning: sanitizedReasoning
      },
      include: {
        model: true
      }
    })

    // Update model statistics
    const modelStats = await prisma.tradeCard.aggregate({
      where: { modelId: model.id },
      _count: { id: true },
      _sum: { pnlPercent: true }
    })

    const winCount = await prisma.tradeCard.count({
      where: { 
        modelId: model.id,
        pnlPercent: { gt: 0 }
      }
    })

    await prisma.tradingModel.update({
      where: { id: model.id },
      data: {
        totalTrades: modelStats._count.id,
        winCount,
        totalPnlPct: modelStats._sum.pnlPercent || 0
      }
    })

    return NextResponse.json({
      success: true,
      tradeCard: {
        id: tradeCard.id,
        modelName: tradeCard.model.name,
        modelAvatar: tradeCard.model.avatar,
        asset: tradeCard.asset,
        direction: tradeCard.direction,
        entryPrice: tradeCard.entryPrice,
        exitPrice: tradeCard.exitPrice,
        leverage: tradeCard.leverage,
        pnlPercent: tradeCard.pnlPercent,
        pnlUsd: tradeCard.pnlUsd,
        holdingHours: tradeCard.holdingHours,
        rarity: tradeCard.rarity,
        reasoning: tradeCard.reasoning,
        createdAt: tradeCard.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating trade card:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const modelId = searchParams.get('modelId')
    const asset = searchParams.get('asset')

    const where = {
      ...(modelId && { modelId }),
      ...(asset && { asset })
    }

    const [tradeCards, total] = await Promise.all([
      prisma.tradeCard.findMany({
        where,
        include: { model: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.tradeCard.count({ where })
    ])

    const formattedCards = tradeCards.map(card => ({
      id: card.id,
      modelName: card.model.name,
      modelAvatar: card.model.avatar,
      asset: card.asset,
      direction: card.direction,
      entryPrice: card.entryPrice,
      exitPrice: card.exitPrice,
      leverage: card.leverage,
      pnlPercent: card.pnlPercent,
      pnlUsd: card.pnlUsd,
      holdingHours: card.holdingHours,
      rarity: card.rarity,
      reasoning: card.reasoning,
      createdAt: card.createdAt
    }))

    return NextResponse.json({
      tradeCards: formattedCards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching trade cards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
