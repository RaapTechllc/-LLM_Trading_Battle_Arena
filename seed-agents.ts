import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AGENTS = [
  {
    tag: '[DMN]',
    name: 'Damien',
    modelProvider: 'dashscope',
    modelId: 'kimi-k2.5',
    executionPath: 'direct',
    strategyPrompt: 'Conservative grid trader. Buy dips, sell rips. 1-2% targets.'
  },
  {
    tag: '[ATL]',
    name: 'Atlas',
    modelProvider: 'dashscope',
    modelId: 'qwen3.5-plus',
    executionPath: 'direct',
    strategyPrompt: 'Macro researcher. Enters on fundamentals, exits on technicals.'
  },
  {
    tag: '[GPT]',
    name: 'GPT-5',
    modelProvider: 'openai-codex',
    modelId: 'gpt-5.4',
    executionPath: 'direct',
    strategyPrompt: 'Momentum chaser. Follows trend, cuts losers fast.'
  },
  {
    tag: '[GRK]',
    name: 'Grok',
    modelProvider: 'xai',
    modelId: 'grok-4-1-fast',
    executionPath: 'direct',
    strategyPrompt: 'Sentiment scanner. Trades Twitter/Reddit signal spikes.'
  },
  {
    tag: '[CLD]',
    name: 'Claude',
    modelProvider: 'anthropic',
    modelId: 'claude-opus-4-6',
    executionPath: 'direct',
    strategyPrompt: 'Risk-adjusted value trader. Hedges every position.'
  }
] as const;

const SEASON_NAME = 'Alpha Season 1';
const TRADING_MODE = 'SIMULATED';
const TRADING_PAIRS = 'BTC,ETH,SOL';
const STARTING_BALANCE = 10000;

async function main() {
  console.log('Seeding Arena agents and Season 1...');

  const agents = [] as Awaited<ReturnType<typeof prisma.arenaAgent.upsert>>[];
  for (const agent of AGENTS) {
    const record = await prisma.arenaAgent.upsert({
      where: { tag: agent.tag },
      update: {
        name: agent.name,
        modelProvider: agent.modelProvider,
        modelId: agent.modelId,
        executionPath: agent.executionPath,
        strategyPrompt: agent.strategyPrompt,
        isActive: true,
      },
      create: {
        ...agent,
        isActive: true,
      },
    });
    agents.push(record);
  }

  await prisma.arenaSeason.updateMany({
    where: { name: { not: SEASON_NAME }, isActive: true },
    data: { isActive: false },
  });

  let season = await prisma.arenaSeason.findFirst({ where: { name: SEASON_NAME } });
  if (season) {
    season = await prisma.arenaSeason.update({
      where: { id: season.id },
      data: {
        roundIntervalMin: 240,
        tradingPairs: TRADING_PAIRS,
        tradingMode: TRADING_MODE,
        isActive: true,
      },
    });
  } else {
    season = await prisma.arenaSeason.create({
      data: {
        name: SEASON_NAME,
        roundIntervalMin: 240,
        tradingPairs: TRADING_PAIRS,
        tradingMode: TRADING_MODE,
        isActive: true,
      },
    });
  }

  for (const agent of agents) {
    await prisma.arenaSeasonEntry.upsert({
      where: {
        agentId_seasonId: {
          agentId: agent.id,
          seasonId: season.id,
        },
      },
      update: {
        startingBalance: STARTING_BALANCE,
        currentBalance: STARTING_BALANCE,
      },
      create: {
        agentId: agent.id,
        seasonId: season.id,
        startingBalance: STARTING_BALANCE,
        currentBalance: STARTING_BALANCE,
        totalPnl: 0,
        realizedPnl: 0,
        unrealizedPnl: 0,
        winCount: 0,
        lossCount: 0,
        totalTrades: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
      },
    });
  }

  const entries = await prisma.arenaSeasonEntry.findMany({
    where: { seasonId: season.id },
    include: { agent: true },
    orderBy: { agent: { tag: 'asc' } },
  });

  console.log('Agents seeded: ' + agents.length);
  console.log('Season: ' + season.name + ' (' + season.tradingMode + ')');
  console.log('Entries: ' + entries.length);
  for (const entry of entries) {
    console.log(entry.agent.tag + ' ' + entry.agent.name + ' -> $' + entry.currentBalance.toFixed(2));
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
