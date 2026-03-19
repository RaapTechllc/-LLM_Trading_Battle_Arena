// LLM Trading Battle Arena Constants
// MUST stay in sync with constants.ts (frontend) and openrouter.ts (API mapping)

export const TRADING_MODELS = [
  { name: "GPT-5.4",            provider: "OpenAI",      avatar: "G54", description: "OpenAI frontier — 1M+ context, advanced reasoning" },
  { name: "GLM-5",              provider: "Z.ai",        avatar: "GLM", description: "Z.ai 744B flagship — coding, agents, long-horizon tasks" },
  { name: "Claude Opus 4.6",    provider: "Anthropic",   avatar: "O46", description: "Anthropic max-intelligence — deep analysis, highest capability" },
  { name: "Claude Sonnet 4.6",  provider: "Anthropic",   avatar: "S46", description: "Anthropic flagship — precision reasoning, constitutional discipline" },
  { name: "Grok 4.20",          provider: "xAI",         avatar: "G42", description: "xAI flagship — 2M context, reasoning, agentic tool calling" },
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

export function getRarity(pnlPercent: number): string {
  const absPnl = Math.abs(pnlPercent);
  if (absPnl >= 10) return "LEGENDARY";
  if (absPnl >= 5) return "EPIC";
  if (absPnl >= 2) return "RARE";
  return "COMMON";
}

export const RARITY_COLORS = {
  LEGENDARY: "#ffd700",
  EPIC: "#a855f7",
  RARE: "#3b82f6",
  COMMON: "#6b7280",
} as const;

export const PNL_COLORS = {
  PROFIT: "#22c55e",
  LOSS: "#ef4444",
} as const;

// Sample trade data for seeding
export const SAMPLE_TRADES = [
  {
    modelName: "Grok 4.20",
    asset: "BTC",
    direction: "LONG",
    leverage: 10,
    entryPrice: 94250,
    exitPrice: 102031,
    pnlPercent: 47.2,
    holdingHours: 4.2,
    reasoning: "Real-time sentiment analysis + RSI divergence on BTC 4h"
  },
  {
    modelName: "GPT-5.4",
    asset: "SOL",
    direction: "LONG",
    leverage: 5,
    entryPrice: 175,
    exitPrice: 198.50,
    pnlPercent: 13.4,
    holdingHours: 6.5,
    reasoning: "Multi-step reasoning chain identified accumulation pattern"
  },
  {
    modelName: "Claude Sonnet 4.6",
    asset: "ETH",
    direction: "SHORT",
    leverage: 3,
    entryPrice: 3420,
    exitPrice: 3180,
    pnlPercent: 7.0,
    holdingHours: 8.1,
    reasoning: "Volatility spike defense — yield preservation mode activated"
  },
  {
    modelName: "Claude Opus 4.6",
    asset: "BTC",
    direction: "LONG",
    leverage: 2,
    entryPrice: 96500,
    exitPrice: 100456,
    pnlPercent: 4.1,
    holdingHours: 12.3,
    reasoning: "Multi-timeframe confluence — MACD + RSI with strict stop-loss"
  },
  {
    modelName: "GLM-5",
    asset: "NVDA",
    direction: "LONG",
    leverage: 3,
    entryPrice: 890,
    exitPrice: 956,
    pnlPercent: 7.4,
    holdingHours: 16.2,
    reasoning: "Sector momentum + earnings revision model flagged upside"
  },
  {
    modelName: "GPT-5.4",
    asset: "SOL",
    direction: "SHORT",
    leverage: 5,
    entryPrice: 245,
    exitPrice: 265.34,
    pnlPercent: -8.3,
    holdingHours: 2.1,
    reasoning: "Macro uncertainty — late entry against momentum"
  },
  {
    modelName: "GLM-5",
    asset: "BTC",
    direction: "LONG",
    leverage: 8,
    entryPrice: 98000,
    exitPrice: 86120,
    pnlPercent: -12.1,
    holdingHours: 1.5,
    reasoning: "High conviction reversal play — stopped out by flash crash"
  },
  {
    modelName: "Grok 4.20",
    asset: "TSLA",
    direction: "LONG",
    leverage: 5,
    entryPrice: 420,
    exitPrice: 462,
    pnlPercent: 10.0,
    holdingHours: 24.0,
    reasoning: "Social sentiment surge + earnings catalyst detected early"
  },
] as const;

export type TradingModel = typeof TRADING_MODELS[number];
export type Asset = typeof ASSETS[number];
export type Direction = typeof DIRECTIONS[number];
export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
