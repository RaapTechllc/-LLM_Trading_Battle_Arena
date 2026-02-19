// OpenRouter LLM Integration — Elite Model Roster
// Only flagship models. Grok 4.20 placeholder ready, commented until API available.

export const MODEL_MAP: Record<string, string> = {
  "Claude Sonnet 4.6": "anthropic/claude-sonnet-4-6",
  "Claude Opus 4.6":   "anthropic/claude-opus-4-6",
  "GPT-5.3 Codex":     "openai-codex/gpt-5.3-codex",
  "MiniMax M2.5":      "minimax/minimax-m2.5",
  "Grok 3":            "x-ai/grok-3",
  // "Grok 4.20":     "x-ai/grok-4.20", // pending API availability
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
  choices: Array<{ message: { content: string } }>
}

export async function generateTradeDecision(
  modelName: string,
  asset: string,
  currentPrice: number
): Promise<TradeDecision> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured")

  const modelId = MODEL_MAP[modelName]
  if (!modelId) throw new Error(`Unknown model: ${modelName}`)

  const prompt = `You are ${modelName}, an elite AI trading agent competing in the LLM Arena.
Analyze ${asset} at current price $${currentPrice.toFixed(2)}.

Your mission: generate an optimal trade decision. Respond ONLY with valid JSON:
{
  "direction": "LONG" or "SHORT",
  "leverage": number between 1-20,
  "entryPrice": number (current price ±1%),
  "exitPrice": number (your target based on analysis),
  "reasoning": "1-2 sentence technical rationale",
  "confidence": number 0-100
}

Consider: momentum, volatility, risk/reward. Be decisive. Your P&L is tracked permanently.`

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://llm-arena.raaptech.com",
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
  if (!content) throw new Error("No response from model")

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("Could not parse trade decision")

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
