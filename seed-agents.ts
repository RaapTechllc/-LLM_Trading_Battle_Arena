import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const agents = [
  {
    tag: '[DMN]', name: 'Damien', modelProvider: 'anthropic', modelId: 'claude-opus-4-6',
    executionPath: 'openclaw',
    strategyPrompt: 'You are Damien, an execution-focused daemon agent. Trade aggressively but verify every position. Bias toward momentum plays. Risk controls are mandatory — never skip stop-loss.',
    riskMaxExposure: 0.80, riskMaxLeverage: 5.0, riskMaxPositions: 3, riskStopLossReq: true,
  },
  {
    tag: '[ATL]', name: 'Atlas', modelProvider: 'anthropic', modelId: 'claude-opus-4-6',
    executionPath: 'openclaw',
    strategyPrompt: 'You are Atlas, an architecture-first strategist. Trade with conviction on macro signals. Prefer high-conviction low-frequency trades over scalping.',
    riskMaxExposure: 0.60, riskMaxLeverage: 3.0, riskMaxPositions: 2, riskStopLossReq: true,
  },
  {
    tag: '[REM]', name: 'Remi', modelProvider: 'minimax', modelId: 'minimax/minimax-m2.5',
    executionPath: 'direct',
    strategyPrompt: 'You are Remi, a customer-focused research agent. Trade based on sentiment and narrative momentum. Conservative sizing, high win-rate focus.',
    riskMaxExposure: 0.50, riskMaxLeverage: 2.0, riskMaxPositions: 3, riskStopLossReq: true,
  },
  {
    tag: '[TPG]', name: 'TopG', modelProvider: 'openai-codex', modelId: 'gpt-5.3-codex',
    executionPath: 'openclaw',
    strategyPrompt: 'You are TopG, a security-first risk manager. Only enter trades with exceptional risk/reward. Hard stops on every position. Never exceed risk parameters.',
    riskMaxExposure: 0.40, riskMaxLeverage: 2.0, riskMaxPositions: 2, riskStopLossReq: true,
  },
  {
    tag: '[MXX]', name: 'Maxx', modelProvider: 'anthropic', modelId: 'claude-sonnet-4-6',
    executionPath: 'direct',
    strategyPrompt: 'You are Maxx, a QA-driven validation agent. Trade only when signals are multi-confirmed. Prefer defensive plays during uncertainty.',
    riskMaxExposure: 0.50, riskMaxLeverage: 2.0, riskMaxPositions: 2, riskStopLossReq: true,
  },
]

async function main() {
  for (const agent of agents) {
    const result = await prisma.arenaAgent.upsert({
      where: { tag: agent.tag },
      update: { ...agent },
      create: { ...agent },
    })
    console.log(result.tag + ' (' + result.id + '): upserted')
  }

  const existing = await prisma.arenaSeason.findFirst({ where: { name: 'Season 1' } })
  if (!existing) {
    const season = await prisma.arenaSeason.create({
      data: {
        name: 'Season 1',
        startedAt: new Date(),
        tradingPairs: 'BTC,ETH,SOL',
      },
    })
    console.log('Season 1 created: ' + season.id)

    const allAgents = await prisma.arenaAgent.findMany({ where: { isActive: true } })
    for (const ag of allAgents) {
      const entry = await prisma.arenaSeasonEntry.create({
        data: {
          seasonId: season.id,
          agentId: ag.id,
          startingBalance: 10000,
          currentBalance: 10000,
        },
      })
      console.log('  Entry for ' + ag.tag + ': ' + entry.id)
    }
  } else {
    console.log('Season 1 already exists: ' + existing.id)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
