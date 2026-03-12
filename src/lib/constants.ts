// LLM Trading Battle Arena — Elite Model Roster
// Only flagship/latest models. Updated when new flagships release.
export const TRADING_MODELS = [
  { name: "Claude Sonnet 4.6",  provider: "Anthropic",   avatar: "S4.6", description: "Anthropic flagship — precision reasoning, constitutional discipline" },
  { name: "Claude Opus 4.6",    provider: "Anthropic",   avatar: "O4.6", description: "Anthropic max-intelligence — deep analysis, highest capability" },
  { name: "GPT-5.3 Codex",      provider: "OpenAI",      avatar: "CDX",  description: "OpenAI Codex-class — advanced reasoning and code-level logic" },
  { name: "MiniMax M2.5",       provider: "MiniMax",     avatar: "M25",  description: "MiniMax flagship — cost-efficient, high throughput" },
  { name: "Grok 3",             provider: "xAI",         avatar: "GRK",  description: "xAI Grok — real-time data awareness, contrarian edge" },
  // { name: "Grok 4.20",       provider: "xAI",         avatar: "G420", description: "xAI Grok 4.20 — pending API availability" },
] as const;

export const ASSETS = [
  { symbol: "BTC",   name: "Bitcoin",   color: "#f7931a" },
  { symbol: "ETH",   name: "Ethereum",  color: "#627eea" },
  { symbol: "SOL",   name: "Solana",    color: "#9945ff" },
  { symbol: "NVDA",  name: "NVIDIA",    color: "#76b900" },
  { symbol: "TSLA",  name: "Tesla",     color: "#e82127" },
  { symbol: "PLTR",  name: "Palantir",  color: "#0066cc" },
  { symbol: "DOGE",  name: "Dogecoin",  color: "#c2a633" },
  { symbol: "AVAX",  name: "Avalanche", color: "#e84142" },
] as const;

export const DIRECTIONS = ["LONG", "SHORT"] as const;
export const LEVERAGE_OPTIONS = [1, 2, 3, 5, 10, 20, 50, 100] as const;

export function getRarity(pnlPercent: number): string {
  const absPnl = Math.abs(pnlPercent);
  if (absPnl >= 10) return "LEGENDARY";
  if (absPnl >= 5)  return "EPIC";
  if (absPnl >= 2)  return "RARE";
  return "COMMON";
}

export const RARITY_COLORS = {
  LEGENDARY: "#ffa500",
  EPIC:      "#a855f7",
  RARE:      "#00d4ff",
  COMMON:    "#5a6580",
} as const;

export const PNL_COLORS = {
  PROFIT: "#00ff88",
  LOSS:   "#ff2240",
} as const;

export const RARITY_EFFECTS = {
  COMMON:    "border-gray-400",
  RARE:      "border-blue-400",
  EPIC:      "border-[#00d4ff]",
  LEGENDARY: "border-yellow-400 ring-2 ring-yellow-400/30",
} as const;

export const BATTLE_STATUS = {
  WAITING:     "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED:   "COMPLETED",
  CANCELLED:   "CANCELLED",
} as const;

export type TradingModel = typeof TRADING_MODELS[number];
export type Asset        = typeof ASSETS[number];
export type Direction    = typeof DIRECTIONS[number];
export type Rarity       = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export type BattleStatus = typeof BATTLE_STATUS[keyof typeof BATTLE_STATUS];

export const DEFAULT_USER_ID = "demo-user" as const;
