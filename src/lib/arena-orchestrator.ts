/**
 * Arena v2 Orchestrator
 * Runs a single round: fetches market data → calls each agent → persists decisions
 * 
 * Invoked by: cron job (every 4h) or POST /api/arena/run-round
 * 
 * Atlas spec: two execution paths
 *   Path A (openclaw): sessions_send() to real agent → structured decision
 *   Path B (direct):   POST to model API with AGENT.md system prompt
 */

import { prisma } from '@/lib/prisma'

export interface TradeDecision {
  action: 'long' | 'short' | 'close' | 'hold'
  pair: string
  size_pct: number        // 0.0 – 1.0
  confidence: number      // 0.0 – 1.0
  reasoning: string
  stop_loss_pct: number   // e.g. 0.05 = 5%
  take_profit_pct: number // e.g. 0.15 = 15%
  leverage?: number       // default 1
}

interface MarketData {
  prices: Record<string, number>    // { BTC: 66000, ETH: 1950, SOL: 82 }
  changes24h: Record<string, number> // % change
  timestamp: string
}

// ── Market Data ──────────────────────────────────────────────

async function fetchMarketData(pairs: string[]): Promise<MarketData> {
  try {
    const res = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'allMids' }),
      signal: AbortSignal.timeout(10000),
    })
    const mids = await res.json() as Record<string, string>
    
    const prices: Record<string, number> = {}
    for (const pair of pairs) {
      const key = pair.replace('-USD', '')
      prices[pair] = parseFloat(mids[key] || '0')
    }

    // 24h change — use CoinGecko as fallback (no key needed)
    const ids = pairs.map(p => p.replace('-USD', '').toLowerCase()).join(',')
    let changes24h: Record<string, number> = {}
    try {
      const cg = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, {
        signal: AbortSignal.timeout(8000)
      })
      const cgData = await cg.json()
      for (const [id, data] of Object.entries(cgData as Record<string, any>)) {
        const pair = `${id.toUpperCase()}-USD`
        changes24h[pair] = data.usd_24h_change ?? 0
      }
    } catch { /* non-fatal */ }

    return { prices, changes24h, timestamp: new Date().toISOString() }
  } catch (err) {
    throw new Error(`Market data fetch failed: ${err}`)
  }
}

// ── Agent Decision: Path B (direct model API) ─────────────────

async function getDecisionDirect(
  agent: { modelId: string; strategyPrompt: string; tag: string },
  marketData: MarketData,
  currentPositions: ArenaTrade[],
  balance: number
): Promise<{ decision: TradeDecision; rawResponse: string; latencyMs: number; tokensUsed: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  const prompt = buildDecisionPrompt(agent.tag, marketData, currentPositions, balance)
  const start = Date.now()

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://llm-arena.raaptech.com',
      'X-Title': 'LLM Arena v2',
    },
    body: JSON.stringify({
      model: agent.modelId,
      messages: [
        { role: 'system', content: agent.strategyPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(30000),
  })

  const latencyMs = Date.now() - start
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)

  const data = await res.json() as any
  const content = data.choices[0]?.message?.content ?? ''
  const tokensUsed = data.usage?.total_tokens ?? 0

  const decision = parseDecision(content)
  return { decision, rawResponse: content, latencyMs, tokensUsed }
}

// ── Agent Decision: Path A (OpenClaw sessions_send) ───────────

async function getDecisionOpenClaw(
  agent: { sessionKey: string; tag: string },
  marketData: MarketData,
  currentPositions: ArenaTrade[],
  balance: number
): Promise<{ decision: TradeDecision; rawResponse: string; latencyMs: number }> {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN
  if (!gatewayUrl || !gatewayToken) throw new Error('OpenClaw gateway not configured')

  const prompt = buildDecisionPrompt(agent.tag, marketData, currentPositions, balance)
  const start = Date.now()

  const res = await fetch(`${gatewayUrl}/tools/invoke`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${gatewayToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tool: 'sessions_send',
      args: {
        sessionKey: agent.sessionKey,
        message: `[ARENA TRADE SIGNAL]\n\n${prompt}\n\nRespond ONLY with valid JSON matching the trade decision schema.`,
        timeoutSeconds: 60,
      }
    }),
    signal: AbortSignal.timeout(90000),
  })

  const latencyMs = Date.now() - start
  if (!res.ok) throw new Error(`Gateway error ${res.status}`)

  const data = await res.json() as any
  const content = data.result?.message ?? data.result ?? ''
  const rawResponse = typeof content === 'string' ? content : JSON.stringify(content)

  const decision = parseDecision(rawResponse)
  return { decision, rawResponse, latencyMs }
}

// ── Risk Controls (TopG spec) ─────────────────────────────────

function checkRiskLimits(
  decision: TradeDecision,
  agent: {
    riskMaxExposure: number
    riskMaxLeverage: number
    riskMaxPositions: number
    riskStopLossReq: boolean
  },
  currentOpenPositions: number,
  currentExposurePct: number
): { passed: boolean; reason?: string } {
  if (decision.action === 'hold' || decision.action === 'close') {
    return { passed: true }
  }

  if (currentOpenPositions >= agent.riskMaxPositions) {
    return { passed: false, reason: `Max positions reached (${agent.riskMaxPositions})` }
  }

  if (currentExposurePct + decision.size_pct > agent.riskMaxExposure) {
    return { passed: false, reason: `Exposure cap breached (${(agent.riskMaxExposure * 100).toFixed(0)}% max)` }
  }

  const leverage = decision.leverage ?? 1
  if (leverage > agent.riskMaxLeverage) {
    return { passed: false, reason: `Leverage ${leverage}x exceeds max ${agent.riskMaxLeverage}x` }
  }

  if (agent.riskStopLossReq && (!decision.stop_loss_pct || decision.stop_loss_pct <= 0)) {
    return { passed: false, reason: 'Stop-loss required but not provided' }
  }

  return { passed: true }
}

// ── Round Runner (main export) ────────────────────────────────

export async function runArenaRound(seasonId: string): Promise<{ roundId: string; decisionsCount: number }> {
  // 1. Get active season + agents
  const season = await prisma.arenaSeason.findUnique({
    where: { id: seasonId },
    include: {
      entries: {
        where: { agent: { isActive: true } },
        include: {
          agent: true,
          trades: { where: { status: 'open' } },
        },
      },
    },
  })

  if (!season) throw new Error(`Season ${seasonId} not found`)

  // 2. Fetch market data
  const pairs = season.tradingPairs.split(',').map(p => `${p.trim()}-USD`)
  const marketData = await fetchMarketData(pairs)

  // 3. Create round record
  const lastRound = await prisma.arenaRound.findFirst({
    where: { seasonId },
    orderBy: { roundNumber: 'desc' },
  })
  const roundNumber = (lastRound?.roundNumber ?? 0) + 1

  const round = await prisma.arenaRound.create({
    data: {
      seasonId,
      roundNumber,
      marketData: marketData as any,
      status: 'in_progress',
    },
  })

  // 4. Get decisions from all agents (parallel)
  let decisionsCount = 0

  await Promise.allSettled(
    season.entries.map(async (entry) => {
      const agent = entry.agent
      const openPositions = entry.trades.length
      const exposurePct = entry.trades.reduce((sum, t) => sum + t.sizePct, 0)

      let decisionResult: {
        decision: TradeDecision
        rawResponse: string
        latencyMs: number
        tokensUsed?: number
      }

      try {
        if (agent.executionPath === 'openclaw' && agent.sessionKey) {
          const r = await getDecisionOpenClaw(
            { sessionKey: agent.sessionKey, tag: agent.tag },
            marketData,
            entry.trades,
            entry.currentBalance,
          )
          decisionResult = { ...r, tokensUsed: undefined }
        } else {
          decisionResult = await getDecisionDirect(
            { modelId: agent.modelId, strategyPrompt: agent.strategyPrompt, tag: agent.tag },
            marketData,
            entry.trades,
            entry.currentBalance,
          )
        }
      } catch (err) {
        // Log failed decision but continue
        await prisma.arenaRoundDecision.create({
          data: {
            roundId: round.id,
            entryId: entry.id,
            action: 'hold',
            reasoning: `Decision failed: ${err}`,
            riskCheckPassed: false,
            rejectionReason: String(err),
          },
        })
        return
      }

      const { decision, rawResponse, latencyMs, tokensUsed } = decisionResult

      // 5. Risk check
      const risk = checkRiskLimits(decision, agent, openPositions, exposurePct)

      // 6. Persist decision
      await prisma.arenaRoundDecision.create({
        data: {
          roundId: round.id,
          entryId: entry.id,
          action: decision.action,
          pair: decision.pair,
          sizePct: decision.size_pct,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          rawResponse,
          latencyMs,
          tokensUsed,
          riskCheckPassed: risk.passed,
          rejectionReason: risk.reason,
        },
      })

      // 7. Execute trade if risk passed
      if (risk.passed && decision.action !== 'hold') {
        const price = marketData.prices[decision.pair] ?? 0
        const size = entry.currentBalance * decision.size_pct

        await prisma.arenaTrade.create({
          data: {
            entryId: entry.id,
            roundId: round.id,
            pair: decision.pair,
            side: decision.action,
            entryPrice: price,
            size,
            sizePct: decision.size_pct,
            leverage: decision.leverage ?? 1,
            stopLoss: price * (1 - (decision.action === 'long' ? decision.stop_loss_pct : -decision.stop_loss_pct)),
            takeProfit: price * (1 + (decision.action === 'long' ? decision.take_profit_pct : -decision.take_profit_pct)),
            reasoning: decision.reasoning,
            confidence: decision.confidence,
            riskCheckPassed: true,
            status: 'open',
          },
        })

        decisionsCount++
      }
    })
  )

  // 8. Mark round complete
  await prisma.arenaRound.update({
    where: { id: round.id },
    data: { status: 'completed', completedAt: new Date() },
  })

  return { roundId: round.id, decisionsCount }
}

// ── Helpers ───────────────────────────────────────────────────

function buildDecisionPrompt(
  agentTag: string,
  marketData: MarketData,
  openPositions: ArenaTrade[],
  balance: number
): string {
  const pricesStr = Object.entries(marketData.prices)
    .map(([pair, price]) => {
      const change = marketData.changes24h[pair] ?? 0
      const sign = change >= 0 ? '+' : ''
      return `${pair}: $${price.toLocaleString()} (${sign}${change.toFixed(2)}% 24h)`
    })
    .join('\n')

  const positionsStr = openPositions.length === 0
    ? 'No open positions.'
    : openPositions.map(p =>
        `${p.side.toUpperCase()} ${p.pair} @ $${p.entryPrice.toLocaleString()} — Size: $${p.size.toLocaleString()} — Stop: $${p.stopLoss?.toLocaleString() ?? 'none'}`
      ).join('\n')

  return `## Arena Round — ${new Date().toISOString()}

### Market Data
${pricesStr}

### Your Portfolio
Balance: $${balance.toLocaleString()}
Open Positions:
${positionsStr}

### Decision Required
Return ONLY valid JSON:
{
  "action": "long" | "short" | "close" | "hold",
  "pair": "BTC-USD" | "ETH-USD" | "SOL-USD",
  "size_pct": 0.10,
  "confidence": 0.80,
  "reasoning": "Your trade thesis in 1-2 sentences",
  "stop_loss_pct": 0.05,
  "take_profit_pct": 0.15,
  "leverage": 2
}

If holding or closing, use action "hold" or "close" with pair of position to close.`
}

function parseDecision(content: string): TradeDecision {
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found in response')

  const raw = JSON.parse(match[0]) as Partial<TradeDecision>
  return {
    action: (['long', 'short', 'close', 'hold'].includes(raw.action ?? ''))
      ? raw.action as TradeDecision['action']
      : 'hold',
    pair: raw.pair ?? 'BTC-USD',
    size_pct: Math.min(Math.max(raw.size_pct ?? 0.05, 0.01), 0.5),
    confidence: Math.min(Math.max(raw.confidence ?? 0.5, 0), 1),
    reasoning: String(raw.reasoning ?? 'No reasoning provided').substring(0, 500),
    stop_loss_pct: Math.min(Math.max(raw.stop_loss_pct ?? 0.05, 0.01), 0.2),
    take_profit_pct: Math.min(Math.max(raw.take_profit_pct ?? 0.15, 0.01), 0.5),
    leverage: Math.min(Math.max(Math.round(raw.leverage ?? 1), 1), 20),
  }
}

// Type stub for trades in this file (full type from Prisma)
interface ArenaTrade {
  pair: string
  side: string
  entryPrice: number
  size: number
  sizePct: number
  stopLoss: number | null
}
