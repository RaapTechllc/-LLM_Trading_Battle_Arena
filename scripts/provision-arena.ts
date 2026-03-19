import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fleet agents configuration
const AGENTS = [
  {
    tag: '[DMN]',
    name: 'Damien',
    modelProvider: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    executionPath: 'openclaw',
    strategyPrompt: "You are Damien, an autonomous trading agent. Analyze the market data envelope and return a JSON trading decision: {action: 'BUY'|'SELL'|'HOLD', asset: string, size: number (0-1, fraction of portfolio), leverage: number (1-5), stopLoss: number (price), takeProfit: number (price), reasoning: string}. Be decisive. Manage risk. Never exceed your configured exposure limits."
  },
  {
    tag: '[ATL]',
    name: 'Atlas',
    modelProvider: 'anthropic',
    modelId: 'claude-opus-4-6',
    executionPath: 'openclaw',
    strategyPrompt: "You are Atlas, a systematic trading agent specializing in deep market analysis. Analyze the market data envelope and return a JSON trading decision: {action: 'BUY'|'SELL'|'HOLD', asset: string, size: number (0-1), leverage: number (1-5), stopLoss: number, takeProfit: number, reasoning: string}. Favor high-conviction setups. Wait for clear signals before entering."
  },
  {
    tag: '[GPT]',
    name: 'TopG',
    modelProvider: 'openai-codex',
    modelId: 'gpt-5.3-codex',
    executionPath: 'direct',
    strategyPrompt: "You are TopG, a momentum trading agent. Analyze the market data envelope and return a JSON trading decision: {action: 'BUY'|'SELL'|'HOLD', asset: string, size: number (0-1), leverage: number (1-5), stopLoss: number, takeProfit: number, reasoning: string}. Ride strong trends, cut losses fast, maximize upside."
  },
  {
    tag: '[REM]',
    name: 'Remi',
    modelProvider: 'minimax',
    modelId: 'minimax-m2.5',
    executionPath: 'openclaw',
    strategyPrompt: "You are Remi, a contrarian trading agent. Analyze the market data envelope and return a JSON trading decision: {action: 'BUY'|'SELL'|'HOLD', asset: string, size: number (0-1), leverage: number (1-5), stopLoss: number, takeProfit: number, reasoning: string}. Look for overextended moves and mean reversion opportunities. Keep leverage low."
  },
  {
    tag: '[MAX]',
    name: 'Maxx',
    modelProvider: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    executionPath: 'direct',
    strategyPrompt: "You are Maxx, an aggressive growth trading agent. Analyze the market data envelope and return a JSON trading decision: {action: 'BUY'|'SELL'|'HOLD', asset: string, size: number (0-1), leverage: number (1-5), stopLoss: number, takeProfit: number, reasoning: string}. Maximize returns. Take calculated risks. Be the alpha."
  }
];

const SEASON_CONFIG = {
  name: 'Season 1 — Genesis',
  roundIntervalMin: 240,
  tradingPairs: 'BTC,ETH,SOL',
  isActive: true
};

const STARTING_BALANCE = 10000;

async function provisionArena() {
  console.log('🏟️  LLM Arena Provisioning\n');
  console.log('='.repeat(60));

  // 1. Upsert ArenaAgents
  console.log('\n📋 Step 1: Upserting ArenaAgents...\n');
  
  const agents = await Promise.all(
    AGENTS.map(async (agent) => {
      const upserted = await prisma.arenaAgent.upsert({
        where: { tag: agent.tag },
        update: {
          name: agent.name,
          modelProvider: agent.modelProvider,
          modelId: agent.modelId,
          executionPath: agent.executionPath,
          strategyPrompt: agent.strategyPrompt,
          isActive: true
        },
        create: agent
      });
      return upserted;
    })
  );

  // Print agents table
  console.log('┌────┬─────────┬────────────────────────────┬────────────────────────────┬───────────┐');
  console.log('│ #  │ Tag     │ Name                       │ Model                      │ Path      │');
  console.log('├────┼─────────┼────────────────────────────┼────────────────────────────┼───────────┤');
  agents.forEach((a, i) => {
    console.log(`│ ${i + 1} │ ${a.tag.padEnd(7)} │ ${a.name.substring(0, 24).padEnd(24)} │ ${(a.modelProvider + '/' + a.modelId).substring(0, 24).padEnd(24)} │ ${a.executionPath.padEnd(9)} │`);
  });
  console.log('└────┴─────────┴────────────────────────────┴────────────────────────────┴───────────┘');

  // 2. Create or get active season
  console.log('\n📅 Step 2: Creating Season 1 if not exists...\n');
  
  let season = await prisma.arenaSeason.findFirst({
    where: { isActive: true }
  });

  if (!season) {
    season = await prisma.arenaSeason.create({
      data: SEASON_CONFIG
    });
    console.log(`✅ Created new active season: "${season.name}" (ID: ${season.id})`);
  } else {
    console.log(`✅ Using existing active season: "${season.name}" (ID: ${season.id})`);
  }

  // 3. Upsert ArenaSeasonEntry for each agent
  console.log('\n💰 Step 3: Creating Season Entries with $10K wallets...\n');
  
  const entries = await Promise.all(
    agents.map(async (agent) => {
      const entry = await prisma.arenaSeasonEntry.upsert({
        where: {
          agentId_seasonId: {
            agentId: agent.id,
            seasonId: season!.id
          }
        },
        update: {
          // Keep existing stats, just ensure it's linked
        },
        create: {
          agentId: agent.id,
          seasonId: season!.id,
          startingBalance: STARTING_BALANCE,
          currentBalance: STARTING_BALANCE,
          totalPnl: 0,
          realizedPnl: 0,
          unrealizedPnl: 0,
          winCount: 0,
          lossCount: 0,
          totalTrades: 0,
          sharpeRatio: 0,
          maxDrawdown: 0
        }
      });
      return { entry, agent };
    })
  );

  // Print entries table
  console.log('┌────┬─────────┬──────────────┬─────────────────┬─────────────┐');
  console.log('│ #  │ Agent   │ Starting Bal │ Current Balance │ Total PnL   │');
  console.log('├────┼─────────┼──────────────┼─────────────────┼─────────────┤');
  entries.forEach(({ entry, agent }, i) => {
    console.log(`│ ${i + 1} │ ${agent.tag.padEnd(7)} │ $${entry.startingBalance.toLocaleString().padEnd(12)} │ $${entry.currentBalance.toLocaleString().padEnd(15)} │ $${entry.totalPnl.toLocaleString().padEnd(10)} │`);
  });
  console.log('└────┴─────────┴──────────────┴─────────────────┴─────────────┘');

  // 4. Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 PROVISIONING SUMMARY');
  console.log('='.repeat(60));
  console.log(`  • Arena Agents: ${agents.length} seeded`);
  console.log(`  • Active Season: "${season.name}"`);
  console.log(`  • Season Entries: ${entries.length} wallets`);
  console.log(`  • Starting Balance: $${STARTING_BALANCE.toLocaleString()} each`);
  console.log(`  • Total Paper Capital: $${(STARTING_BALANCE * entries.length).toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('✅ Arena provisioning complete!\n');
}

provisionArena()
  .catch((e) => {
    console.error('❌ Provisioning failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
