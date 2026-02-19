// OpenRouter LLM Integration for AI Trading Decisions

export const MODEL_MAP: Record<string, string> = {
  // Anthropic — 4.6 models (sonnet-4-6, opus-4-6)
  "Claude Sonnet 4.6": "anthropic/claude-sonnet-4-6",
  "Claude Opus 4.6":   "anthropic/claude-opus-4-6",
  "Claude Sonnet":     "anthropic/claude-3.5-sonnet",
  // xAI — Grok 420 not on API yet; using Grok 3
  "Grok 3":            "x-ai/grok-3",
  // OpenAI
  "GPT-4o":            "openai/gpt-4o",
  // Google
  "Gemini 2.0 Flash":  "google/gemini-2.0-flash-001",
  // DeepSeek
  "DeepSeek V3":       "deepseek/deepseek-chat",
  // Qwen
  "Qwen 3 Max":        "qwen/qwen-2.5-72b-instruct",
}

export interface TradeDecision {
  direction: "LONG" | "SHORT"
  leverage: number
  entryPrice: number
  exitPrice: number
  reasoning: string
  confidence: number
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function generateTradeDecision(
  modelName: string,
  asset: string,
  currentPrice: number
): Promise<TradeDecision> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured")
  }

  const modelId = MODEL_MAP[modelName]
  if (!modelId) {
    throw new Error(`Unknown model: ${modelName}`)
  }

  const prompt = `You are ${modelName}, an AI trading model. Analyze ${asset} at current price $${currentPrice.toFixed(2)}.

Generate a simulated trade decision. Respond ONLY with valid JSON:
{
  "direction": "LONG" or "SHORT",
  "leverage": number between 1-20,
  "entryPrice": number (current price ±2%),
  "exitPrice": number (target price based on your analysis),
  "reasoning": "Brief 1-2 sentence trading rationale",
  "confidence": number 0-100
}

Consider: market momentum, volatility, risk/reward ratio. Be decisive.`

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://battlecard-arena.vercel.app",
      "X-Title": "LLM Trading Battle Arena"
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7
    }),
    signal: AbortSignal.timeout(30000)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`)
  }

  const data: OpenRouterResponse = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error("No response from model")
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Could not parse trade decision")
  }

  const decision = JSON.parse(jsonMatch[0]) as TradeDecision

  return {
    direction: decision.direction === "SHORT" ? "SHORT" : "LONG",
    leverage: Math.min(Math.max(Math.round(decision.leverage), 1), 20),
    entryPrice: decision.entryPrice || currentPrice,
    exitPrice: decision.exitPrice || currentPrice * (decision.direction === "LONG" ? 1.05 : 0.95),
    reasoning: String(decision.reasoning || "Market analysis").substring(0, 200),
    confidence: Math.min(Math.max(decision.confidence || 50, 0), 100)
  }
}
