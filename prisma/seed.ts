import { PrismaClient } from '@prisma/client';
import { TRADING_MODELS, SAMPLE_TRADES, getRarity } from '../src/lib/trading-constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding LLM Trading Battle Arena...');

  // Create trading models
  console.log('📊 Creating trading models...');
  for (const modelData of TRADING_MODELS) {
    await prisma.tradingModel.upsert({
      where: { name: modelData.name },
      update: {},
      create: {
        name: modelData.name,
        provider: modelData.provider,
        avatar: modelData.avatar,
        description: modelData.description,
      },
    });
  }

  // Create trade cards
  console.log('🃏 Creating trade cards...');
  for (const trade of SAMPLE_TRADES) {
    const model = await prisma.tradingModel.findUnique({
      where: { name: trade.modelName },
    });

    if (!model) {
      console.error(`Model not found: ${trade.modelName}`);
      continue;
    }

    // Calculate P&L USD (assuming $10k position)
    const positionSize = 10000;
    const pnlUsd = (positionSize * trade.pnlPercent) / 100;
    const rarity = getRarity(trade.pnlPercent);

    await prisma.tradeCard.create({
      data: {
        modelId: model.id,
        asset: trade.asset,
        direction: trade.direction,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        leverage: trade.leverage,
        pnlPercent: trade.pnlPercent,
        pnlUsd: pnlUsd,
        holdingHours: trade.holdingHours,
        rarity: rarity,
        reasoning: trade.reasoning,
      },
    });
  }

  // Update model stats
  console.log('📈 Updating model statistics...');
  for (const modelData of TRADING_MODELS) {
    const model = await prisma.tradingModel.findUnique({
      where: { name: modelData.name },
      include: { tradeCards: true },
    });

    if (model) {
      const totalTrades = model.tradeCards.length;
      const winCount = model.tradeCards.filter(card => card.pnlPercent > 0).length;
      const totalPnlPct = model.tradeCards.reduce((sum, card) => sum + card.pnlPercent, 0);

      await prisma.tradingModel.update({
        where: { id: model.id },
        data: {
          totalTrades,
          winCount,
          totalPnlPct,
        },
      });
    }
  }

  console.log('✅ Seeding completed!');
  
  // Print summary
  const modelCount = await prisma.tradingModel.count();
  const tradeCount = await prisma.tradeCard.count();
  
  console.log(`📊 Created ${modelCount} trading models`);
  console.log(`🃏 Created ${tradeCount} trade cards`);
  
  // Show top performers
  const topModels = await prisma.tradingModel.findMany({
    orderBy: { totalPnlPct: 'desc' },
    take: 3,
  });
  
  console.log('\n🏆 Top Performing Models:');
  topModels.forEach((model, index) => {
    const winRate = model.totalTrades > 0 ? (model.winCount / model.totalTrades * 100).toFixed(1) : '0';
    console.log(`${index + 1}. ${model.avatar} ${model.name}: ${model.totalPnlPct.toFixed(1)}% (${winRate}% win rate)`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
