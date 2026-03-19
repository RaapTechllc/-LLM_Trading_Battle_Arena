import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model1Name, model2Name } = body

    // Validate input
    if (!model1Name || !model2Name) {
      return NextResponse.json(
        { error: 'Both models must be selected' },
        { status: 400 }
      )
    }

    if (model1Name === model2Name) {
      return NextResponse.json(
        { error: 'Please select two different models' },
        { status: 400 }
      )
    }

    // Find both models
    const [model1, model2] = await Promise.all([
      prisma.tradingModel.findUnique({ where: { name: model1Name } }),
      prisma.tradingModel.findUnique({ where: { name: model2Name } })
    ])

    if (!model1 || !model2) {
      return NextResponse.json(
        { error: 'One or both models not found' },
        { status: 404 }
      )
    }

    // Get top 3 trade cards for each model by P&L
    const [model1Cards, model2Cards] = await Promise.all([
      prisma.tradeCard.findMany({
        where: { modelId: model1.id },
        orderBy: { pnlPercent: 'desc' },
        take: 3,
        include: { model: true }
      }),
      prisma.tradeCard.findMany({
        where: { modelId: model2.id },
        orderBy: { pnlPercent: 'desc' },
        take: 3,
        include: { model: true }
      })
    ])

    // Validate both models have at least one trade card
    if (model1Cards.length === 0 || model2Cards.length === 0) {
      const emptyModel = model1Cards.length === 0 ? model1.name : model2.name
      return NextResponse.json(
        { error: `${emptyModel} has no trade cards yet. Try simulating some trades first.` },
        { status: 400 }
      )
    }

    // Calculate total scores
    const model1Score = model1Cards.reduce((sum, card) => sum + card.pnlPercent, 0)
    const model2Score = model2Cards.reduce((sum, card) => sum + card.pnlPercent, 0)

    // Determine winner
    let winnerId = null
    if (model1Score > model2Score) winnerId = model1.id
    else if (model2Score > model1Score) winnerId = model2.id
    // null for tie

    // Create battle record
    const battle = await prisma.modelBattle.create({
      data: {
        model1Id: model1.id,
        model2Id: model2.id,
        model1Cards: JSON.stringify(model1Cards.map(c => c.id)),
        model2Cards: JSON.stringify(model2Cards.map(c => c.id)),
        model1Score,
        model2Score,
        winnerId
      }
    })

    // Format response
    const formatCard = (card: any) => ({
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
      reasoning: card.reasoning
    })

    return NextResponse.json({
      battleId: battle.id,
      model1: {
        id: model1.id,
        name: model1.name,
        avatar: model1.avatar,
        provider: model1.provider,
        cards: model1Cards.map(formatCard),
        score: model1Score
      },
      model2: {
        id: model2.id,
        name: model2.name,
        avatar: model2.avatar,
        provider: model2.provider,
        cards: model2Cards.map(formatCard),
        score: model2Score
      },
      winner: winnerId ? (winnerId === model1.id ? 'model1' : 'model2') : 'tie',
      createdAt: battle.createdAt
    })

  } catch (error) {
    console.error('Error creating showdown:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get recent battles for history/stats
    const recentBattles = await prisma.modelBattle.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        model1: true,
        model2: true
      }
    })

    const battles = recentBattles.map(battle => ({
      id: battle.id,
      model1Name: battle.model1.name,
      model1Avatar: battle.model1.avatar,
      model2Name: battle.model2.name,
      model2Avatar: battle.model2.avatar,
      model1Score: battle.model1Score,
      model2Score: battle.model2Score,
      winner: battle.winnerId ? 
        (battle.winnerId === battle.model1Id ? 'model1' : 'model2') : 'tie',
      createdAt: battle.createdAt
    }))

    return NextResponse.json({ battles })

  } catch (error) {
    console.error('Error fetching showdown history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
