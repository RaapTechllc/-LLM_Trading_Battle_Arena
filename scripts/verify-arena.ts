import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  const [agents, seasons, entries] = await Promise.all([
    prisma.arenaAgent.findMany(),
    prisma.arenaSeason.findMany(),
    prisma.arenaSeasonEntry.findMany()
  ]);

  console.log('=== ARENA AGENTS ===');
  agents.forEach(a => console.log(`${a.tag} | ${a.name} | ${a.modelProvider}/${a.modelId} | ${a.executionPath}`));
  
  console.log('\n=== SEASONS ===');
  seasons.forEach(s => console.log(`${s.name} | Active: ${s.isActive} | Pairs: ${s.tradingPairs}`));
  
  console.log('\n=== ENTRIES (Wallets) ===');
  for (const e of entries) {
    const agent = await prisma.arenaAgent.findUnique({ where: { id: e.agentId } });
    console.log(`${agent?.tag || e.agentId.substring(0,8)} | Balance: $${e.currentBalance.toLocaleString()} | PnL: $${e.totalPnl.toLocaleString()}`);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Agents: ${agents.length}`);
  console.log(`Seasons: ${seasons.length}`);
  console.log(`Entries: ${entries.length}`);

  await prisma.$disconnect();
}

verify().catch(console.error);
