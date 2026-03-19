// OpenRouter LLM Integration — Elite Model Roster
// MODEL_MAP keys must match TRADING_MODELS names in constants.ts

export const MODEL_MAP: Record<string, string> = {
  "GPT-5.4":            "openai/gpt-5.4",
  "GLM-5":              "z-ai/glm-5",
  "Claude Opus 4.6":    "anthropic/claude-opus-4-6",
  "Claude Sonnet 4.6":  "anthropic/claude-sonnet-4-6",
  "Grok 4.20":          "x-ai/grok-4.20-beta",
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

  // Parse leverage defensively — models sometimes return "10x" or objects
  let parsedLeverage = Number(String(decision.leverage).replace(/[^0-9.]/g, ''))
  if (!parsedLeverage || isNaN(parsedLeverage)) parsedLeverage = 5
  parsedLeverage = Math.min(Math.max(Math.round(parsedLeverage), 1), 20)

  // Parse other numeric fields defensively
  const entryPrice = Number(decision.entryPrice) || currentPrice
  const exitPrice = Number(decision.exitPrice) || currentPrice * (decision.direction === "LONG" ? 1.05 : 0.95)
  const confidence = Number(decision.confidence) || 50

  return {
    direction: decision.direction === "SHORT" ? "SHORT" : "LONG",
    leverage: parsedLeverage,
    entryPrice,
    exitPrice,
    reasoning: String(decision.reasoning || "Market analysis").substring(0, 200),
    confidence: Math.min(Math.max(confidence, 0), 100)
  }
}
