// LLM Trading Battle Arena Constants
export const TRADING_MODELS = [
  { name: "Claude Sonnet 4.6", provider: "Anthropic", avatar: "S4.6", description: "Claude Sonnet 4.6 — precision reasoning, constitutional discipline" },
  { name: "Claude Opus 4.6",   provider: "Anthropic", avatar: "O4.6", description: "Claude Opus 4.6 — maximum intelligence, deep analysis" },
  { name: "Claude Sonnet",     provider: "Anthropic", avatar: "S3.5", description: "Claude 3.5 Sonnet — battle-tested baseline" },
  { name: "Grok 3",            provider: "xAI",       avatar: "GRK",  description: "Grok 3 — X real-time data, Elon-mode risk tolerance" },
  { name: "GPT-4o",            provider: "OpenAI",    avatar: "GPT",  description: "GPT-4o — OpenAI flagship, multimodal analysis" },
  { name: "Gemini 2.0 Flash",  provider: "Google",    avatar: "GEM",  description: "Gemini 2.0 Flash — speed-optimized, Google-scale data" },
  { name: "DeepSeek V3",       provider: "DeepSeek",  avatar: "DSK",  description: "DeepSeek V3 — chain-of-thought, deep market reasoning" },
  { name: "Qwen 3 Max",        provider: "Alibaba",   avatar: "QWN",  description: "Qwen 3 Max — multi-modal, Asia-market expertise" },
] as const;

export const ASSETS = [
  { symbol: "BTC",   name: "Bitcoin",   color: "#f7931a" },
  { symbol: "ETH",   name: "Ethereum",  color: "#627eea" },
  { symbol: "SOL",   name: "Solana",    color: "#9945ff" },
  { symbol: "AVAX",  name: "Avalanche", color: "#e84142" },
  { symbol: "DOGE",  name: "Dogecoin",  color: "#c2a633" },
  { symbol: "NVDA",  name: "NVIDIA",    color: "#76b900" },
  { symbol: "TSLA",  name: "Tesla",     color: "#cc0000" },
  { symbol: "AAPL",  name: "Apple",     color: "#555555" },
  { symbol: "MSFT",  name: "Microsoft", color: "#00a4ef" },
  { symbol: "GOOGL", name: "Alphabet",  color: "#4285f4" },
  { symbol: "META",  name: "Meta",      color: "#1877f2" },
  { symbol: "AMZN",  name: "Amazon",    color: "#ff9900" },
  { symbol: "PLTR",  name: "Palantir",  color: "#0066cc" },
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
  LEGENDARY: "#f59e0b",
  EPIC:      "#a855f7",
  RARE:      "#3b82f6",
  COMMON:    "#64748b",
} as const;

export const PNL_COLORS = {
  PROFIT: "#00ff88",
  LOSS:   "#ff3366",
} as const;

export const RARITY_EFFECTS = {
  COMMON:    "border-gray-400",
  RARE:      "border-blue-400 shadow-lg shadow-blue-400/20",
  EPIC:      "border-purple-400 shadow-lg shadow-purple-400/30",
  LEGENDARY: "border-yellow-400 shadow-lg shadow-yellow-400/40 ring-2 ring-yellow-400/30"
} as const;

export const BATTLE_STATUS = {
  WAITING:     "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED:   "COMPLETED",
  CANCELLED:   "CANCELLED"
} as const;

export type TradingModel = typeof TRADING_MODELS[number];
export type Asset        = typeof ASSETS[number];
export type Direction    = typeof DIRECTIONS[number];
export type Rarity       = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export type BattleStatus = typeof BATTLE_STATUS[keyof typeof BATTLE_STATUS];

export const DEFAULT_USER_ID = "demo-user" as const;
