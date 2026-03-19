import { PrismaClient } from '@prisma/client';
import { TRADING_MODELS, ASSETS, DIRECTIONS, LEVERAGE_OPTIONS, getRarity } from '../src/lib/constants';

const prisma = new PrismaClient();

// Generate realistic trade scenarios
const generateTradeScenario = () => {
  const model = TRADING_MODELS[Math.floor(Math.random() * TRADING_MODELS.length)];
  const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
  const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
  const leverage = LEVERAGE_OPTIONS[Math.floor(Math.random() * LEVERAGE_OPTIONS.length)];
  
  // Generate realistic price movements
  const basePrice = asset.symbol === 'BTC' ? 95000 : 
                   asset.symbol === 'ETH' ? 3500 :
                   asset.symbol === 'SOL' ? 250 : 
                   asset.symbol === 'PLTR' ? 65 :
                   asset.symbol === 'TSLA' ? 420 : 890; // NVDA
  
  const entryPrice = basePrice * (0.8 + Math.random() * 0.4); // ±20% variation
  
  // Generate P&L with realistic distribution (more small gains/losses, fewer huge ones)
  const random = Math.random();
  let pnlMultiplier;
  if (random < 0.6) {
    // 60% small moves (-5% to +5%)
    pnlMultiplier = (Math.random() - 0.5) * 0.1;
  } else if (random < 0.85) {
    // 25% medium moves (-15% to +15%)
    pnlMultiplier = (Math.random() - 0.5) * 0.3;
  } else {
    // 15% large moves (-30% to +30%)
    pnlMultiplier = (Math.random() - 0.5) * 0.6;
  }
  
  const exitPrice = entryPrice * (1 + pnlMultiplier);
  let pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
  if (direction === 'SHORT') pnlPercent = -pnlPercent;
  pnlPercent *= leverage;
  
  const positionSize = 10000;
  const pnlUsd = (positionSize * pnlPercent) / 100;
  const holdingHours = Math.random() * 48 + 0.5; // 0.5 to 48.5 hours
  
  const reasoningOptions = [
    "RSI oversold + volume confirmation",
    "Breakout above key resistance level", 
    "Twitter sentiment spike detected",
    "MACD bullish crossover signal",
    "Support level bounce play",
    "Momentum following news catalyst",
    "Technical pattern completion",
    "Institutional flow detected",
    "Moving average convergence",
    "Fibonacci retracement level",
    "Volume profile analysis",
    "Market structure shift",
    "Liquidity grab opportunity",
    "Trend continuation signal",
    "Mean reversion setup"
  ];
  
  return {
    modelName: model.name,
    asset: asset.symbol,
    direction,
    entryPrice: Math.round(entryPrice * 100) / 100,
    exitPrice: Math.round(exitPrice * 100) / 100,
    leverage,
    pnlPercent: Math.round(pnlPercent * 100) / 100,
    pnlUsd: Math.round(pnlUsd * 100) / 100,
    holdingHours: Math.round(holdingHours * 10) / 10,
    rarity: getRarity(pnlPercent),
    reasoning: reasoningOptions[Math.floor(Math.random() * reasoningOptions.length)]
  };
};

async function seedLargeDataset(cardCount: number = 500) {
  console.log(`🚀 Seeding ${cardCount} trade cards for performance testing...`);
  
  const batchSize = 50;
  const batches = Math.ceil(cardCount / batchSize);
  
  for (let batch = 0; batch < batches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, cardCount);
    const batchCards = [];
    
    console.log(`📦 Processing batch ${batch + 1}/${batches} (cards ${batchStart + 1}-${batchEnd})`);
    
    for (let i = batchStart; i < batchEnd; i++) {
      const trade = generateTradeScenario();
      
      // Find the trading model
      const model = await prisma.tradingModel.findUnique({
        where: { name: trade.modelName }
      });
      
      if (model) {
        batchCards.push({
          modelId: model.id,
          asset: trade.asset,
          direction: trade.direction,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          leverage: trade.leverage,
          pnlPercent: trade.pnlPercent,
          pnlUsd: trade.pnlUsd,
          holdingHours: trade.holdingHours,
          rarity: trade.rarity,
          reasoning: trade.reasoning
        });
      }
    }
    
    // Batch insert
    if (batchCards.length > 0) {
      await prisma.tradeCard.createMany({
        data: batchCards
      });
    }
  }
  
  // Update model statistics
  console.log('📈 Updating model statistics...');
  for (const modelData of TRADING_MODELS) {
    const model = await prisma.tradingModel.findUnique({
      where: { name: modelData.name },
      include: { tradeCards: true }
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
          totalPnlPct
        }
      });
    }
  }
  
  console.log('✅ Large dataset seeding completed!');
  
  // Print summary
  const totalCards = await prisma.tradeCard.count();
  const modelStats = await prisma.tradingModel.findMany({
    orderBy: { totalPnlPct: 'desc' }
  });
  
  console.log(`📊 Total trade cards: ${totalCards}`);
  console.log('\n🏆 Updated Model Rankings:');
  modelStats.forEach((model, index) => {
    const winRate = model.totalTrades > 0 ? (model.winCount / model.totalTrades * 100).toFixed(1) : '0';
    console.log(`${index + 1}. ${model.avatar} ${model.name}: ${model.totalPnlPct.toFixed(1)}% (${model.totalTrades} trades, ${winRate}% win rate)`);
  });
}

async function main() {
  const cardCount = process.argv[2] ? parseInt(process.argv[2]) : 500;
  await seedLargeDataset(cardCount);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
