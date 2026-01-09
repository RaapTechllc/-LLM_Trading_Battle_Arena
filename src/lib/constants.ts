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
  LEGENDARY: "#f59e0b", // Gold
  EPIC: "#a855f7",     // Purple
  RARE: "#3b82f6",     // Blue
  COMMON: "#64748b",   // Slate
} as const;

export const PNL_COLORS = {
  PROFIT: "#00ff88",   // Bright mint green
  LOSS: "#ff3366",     // Hot pink-red
} as const;

// Enhanced rarity effects for holographic cards
export const RARITY_EFFECTS = {
  COMMON: 'border-gray-400',
  RARE: 'border-blue-400 shadow-lg shadow-blue-400/20',
  EPIC: 'border-purple-400 shadow-lg shadow-purple-400/30',
  LEGENDARY: 'border-yellow-400 shadow-lg shadow-yellow-400/40 ring-2 ring-yellow-400/30'
} as const;

// Battle System Constants
export const BATTLE_STATUS = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

// Type definitions
export type TradingModel = typeof TRADING_MODELS[number];
export type Asset = typeof ASSETS[number];
export type Direction = typeof DIRECTIONS[number];
export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export type BattleStatus = typeof BATTLE_STATUS[keyof typeof BATTLE_STATUS];

// User constants for MVP
export const DEFAULT_USER_ID = 'demo-user' as const;
