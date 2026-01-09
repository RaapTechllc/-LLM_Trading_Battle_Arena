// LLM Trading Battle Arena Constants

export const TRADING_MODELS = [
  { name: "Grok 4.20", provider: "xAI", avatar: "🚀", description: "Real-time social sentiment analysis" },
  { name: "Claude Sonnet", provider: "Anthropic", avatar: "🎭", description: "Constitutional AI trading approach" },
  { name: "DeepSeek V3", provider: "DeepSeek", avatar: "🔮", description: "Deep reasoning for market analysis" },
  { name: "Qwen 3 Max", provider: "Alibaba", avatar: "⚡", description: "Multi-modal market intelligence" },
  { name: "GPT-5", provider: "OpenAI", avatar: "🧠", description: "Advanced reasoning and prediction" },
  { name: "Gemini 3", provider: "Google", avatar: "💎", description: "Multimodal market analysis" },
] as const;

export const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", color: "#627eea" },
  { symbol: "SOL", name: "Solana", color: "#9945ff" },
  { symbol: "PLTR", name: "Palantir", color: "#0066cc" },
  { symbol: "TSLA", name: "Tesla", color: "#cc0000" },
  { symbol: "NVDA", name: "NVIDIA", color: "#76b900" },
] as const;

export const DIRECTIONS = ["LONG", "SHORT"] as const;

export const LEVERAGE_OPTIONS = [1, 2, 3, 5, 10, 20, 50, 100] as const;

// Rarity based on P&L percentage
export function getRarity(pnlPercent: number): string {
  const absPnl = Math.abs(pnlPercent);
  if (absPnl >= 10) return "LEGENDARY";
  if (absPnl >= 5) return "EPIC";
  if (absPnl >= 2) return "RARE";
  return "COMMON";
}

export const RARITY_COLORS = {
  LEGENDARY: "#ffd700", // Gold
  EPIC: "#a855f7",     // Purple
  RARE: "#3b82f6",     // Blue
  COMMON: "#6b7280",   // Gray
} as const;

export const PNL_COLORS = {
  PROFIT: "#22c55e",   // Green
  LOSS: "#ef4444",     // Red
} as const;

// Sample trade data for seeding
export const SAMPLE_TRADES = [
  // Grok winning trades (based on Alpha Arena research)
  { 
    modelName: "Grok 4.20", 
    asset: "PLTR", 
    direction: "LONG", 
    leverage: 10, 
    entryPrice: 65.20, 
    exitPrice: 90.07, 
    pnlPercent: 38.1, 
    holdingHours: 6.5,
    reasoning: "Twitter sentiment spike detected 2hrs before retail" 
  },
  { 
    modelName: "Grok 4.20", 
    asset: "BTC", 
    direction: "LONG", 
    leverage: 5, 
    entryPrice: 94250, 
    exitPrice: 102031, 
    pnlPercent: 8.2, 
    holdingHours: 4.2,
    reasoning: "RSI divergence + volume confirmation" 
  },
  
  // DeepSeek trades
  { 
    modelName: "DeepSeek V3", 
    asset: "ETH", 
    direction: "LONG", 
    leverage: 3, 
    entryPrice: 3420, 
    exitPrice: 3649, 
    pnlPercent: 6.7, 
    holdingHours: 8.1,
    reasoning: "Buy on pullback, increase on breakout" 
  },
  
  // Qwen trades
  { 
    modelName: "Qwen 3 Max", 
    asset: "BTC", 
    direction: "LONG", 
    leverage: 2, 
    entryPrice: 96500, 
    exitPrice: 100456, 
    pnlPercent: 4.1, 
    holdingHours: 12.3,
    reasoning: "MACD + RSI with strict stop-loss" 
  },
  
  // Losing trades
  { 
    modelName: "GPT-5", 
    asset: "SOL", 
    direction: "SHORT", 
    leverage: 5, 
    entryPrice: 245, 
    exitPrice: 265.34, 
    pnlPercent: -8.3, 
    holdingHours: 2.1,
    reasoning: "Macro uncertainty - late entry" 
  },
  { 
    modelName: "Gemini 3", 
    asset: "BTC", 
    direction: "LONG", 
    leverage: 40, 
    entryPrice: 98000, 
    exitPrice: 86120, 
    pnlPercent: -12.1, 
    holdingHours: 1.5,
    reasoning: "High conviction reversal play" 
  },
  
  // More diverse trades
  { 
    modelName: "Claude Sonnet", 
    asset: "TSLA", 
    direction: "LONG", 
    leverage: 3, 
    entryPrice: 420, 
    exitPrice: 462, 
    pnlPercent: 10.0, 
    holdingHours: 24.0,
    reasoning: "Earnings beat + production guidance raise" 
  },
  { 
    modelName: "DeepSeek V3", 
    asset: "NVDA", 
    direction: "SHORT", 
    leverage: 2, 
    entryPrice: 890, 
    exitPrice: 823, 
    pnlPercent: 7.5, 
    holdingHours: 16.2,
    reasoning: "Overvaluation + sector rotation signals" 
  },
] as const;

export type TradingModel = typeof TRADING_MODELS[number];
export type Asset = typeof ASSETS[number];
export type Direction = typeof DIRECTIONS[number];
export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
