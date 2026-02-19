/**
 * Arena v2 Orchestrator
 * Atlas spec + TopG security review applied:
 *   - sessionKey never stored in DB — read from ~/.secrets/arena/<tag>.key at runtime
 *   - Market data wrapped in trusted envelope before injection into agent sessions
 *   - Kill switch: ARENA_KILL_SWITCH env var (global halt)
 *   - Per-agent halt: arenaAgent.haltedUntil (drawdown breach)
 *   - rawResponse access-controlled (stored in DB, not exposed in public API)
 *   - strategyPrompt/agentMd excluded from public API endpoints
 */

import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export interface TradeDecision {
  action: 'long' | 'short' | 'close' | 'hold'
  pair: string
  size_pct: number
  confidence: number
  reasoning: string
  stop_loss_pct: number
  take_profit_pct: number
  leverage?: number
}

interface MarketData {
  prices: Record<string, number>
  changes24h: Record<string, number>
  timestamp: string
}

// ── Kill Switch (global + per-agent) ─────────────────────────

function checkKillSwitch(): void {
  if (process.env.ARENA_KILL_SWITCH === 'true' || process.env.ARENA_KILL_SWITCH === '1') {
    throw new Error('ARENA_KILL_SWITCH active — all trading halted')
  }
}

async function checkAgentHalt(agentTag: string, haltedUntil: Date | null): Promise<void> {
  if (haltedUntil && new Date() < haltedUntil) {
    throw new Error(`Agent ${agentTag} halted until ${haltedUntil.toISOString()} (drawdown breach)`)
  }
}

// ── Session Key (TopG blocker 1 — never in DB) ────────────────

function readAgentSessionKey(tag: string): string | null {
  // Keys stored at ~/.secrets/arena/<lowercase-tag>.key on the Arena server
  // Never in DB, never in environment (prevents DB read = session hijack)
  try {
    const keyFile = path.join(
      process.env.HOME ?? '/root',
      '.secrets', 'arena',
      `${tag.toLowerCase().replace(/[^a-z0-9]/g, '')}.key`
    )
    if (fs.existsSync(keyFile)) {
      return fs.readFileSync(keyFile, 'utf8').trim()
    }
  } catch { /* key file absent = Path B */ }
  return null
}

// ── Market Data ───────────────────────────────────────────────

async function fetchMarketData(pairs: string[]): Promise<MarketData> {
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
    const raw = parseFloat(mids[key] ?? '0')
    // Sanity check: reject obviously malicious values
    if (raw <= 0 || raw > 10_000_000) continue
    prices[pair] = raw
  }

  return { prices, changes24h: {}, timestamp: new Date().toISOString() }
}

// ── Trusted Envelope (TopG blocker 2 — prompt injection guard) ─

function buildTrustedEnvelope(
  agentTag: string,
  marketData: MarketData,
  openPositions: LocalTrade[],
  balance: number
): string {
  const pricesStr = Object.entries(marketData.prices)
    .map(([pair, price]) => `${pair}: $${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`)
    .join(' | ')

  const positionsStr = openPositions.length === 0
    ? 'NONE'
    : openPositions.map(p =>
        `${p.side.toUpperCase()} ${p.pair} @$${p.entryPrice.toLocaleString()} size=${(p.sizePct * 100).toFixed(0)}% SL=${p.stopLoss ? '$' + p.stopLoss.toLocaleString() : 'NONE'}`
      ).join('; ')

  return [
    '--- ARENA_ROUND_DATA START (system-generated, trusted) ---',
    `TIMESTAMP: ${marketData.timestamp}`,
    `PRICES: ${pricesStr}`,
    `BALANCE: $${balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
    `OPEN_POSITIONS: ${positionsStr}`,
    '--- ARENA_ROUND_DATA END ---',
    '',
    'Return ONLY valid JSON with your trade decision:',
    '{',
    '  "action": "long" | "short" | "close" | "hold",',
    '  "pair": "BTC-USD" | "ETH-USD" | "SOL-USD",',
    '  "size_pct": 0.10,',
    '  "confidence": 0.80,',
    '  "reasoning": "1-2 sentence thesis",',
    '  "stop_loss_pct": 0.05,',
    '  "take_profit_pct": 0.15,',
    '  "leverage": 2',
    '}',
  ].join('\n')
}

// ── Path A: OpenClaw sessions_send ────────────────────────────

async function getDecisionOpenClaw(
  agentTag: string,
  sessionKey: string,
  envelope: string
): Promise<{ decision: TradeDecision; rawResponse: string; latencyMs: number }> {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL_DAMIEN ?? process.env.OPENCLAW_GATEWAY_URL
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN_DAMIEN ?? process.env.OPENCLAW_GATEWAY_TOKEN
  if (!gatewayUrl || !gatewayToken) throw new Error('OpenClaw gateway not configured')

  const start = Date.now()
  const res = await fetch(`${gatewayUrl}/tools/invoke`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${gatewayToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool: 'sessions_send',
      args: { sessionKey, message: envelope, timeoutSeconds: 60 },
    }),
    signal: AbortSignal.timeout(90000),
  })

  const latencyMs = Date.now() - start
  if (!res.ok) throw new Error(`Gateway error ${res.status}`)

  const data = await res.json() as any
  const rawResponse = typeof data.result?.message === 'string'
    ? data.result.message
    : JSON.stringify(data.result ?? '')

  return { decision: parseDecision(rawResponse), rawResponse, latencyMs }
}

// ── Path B: Direct model API ──────────────────────────────────

async function getDecisionDirect(
  modelId: string,
  strategyPrompt: string,
  envelope: string
): Promise<{ decision: TradeDecision; rawResponse: string; latencyMs: number; tokensUsed: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

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
      model: modelId,
      messages: [
        { role: 'system', content: strategyPrompt },
        { role: 'user', content: envelope },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(30000),
  })

  const latencyMs = Date.now() - start
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)

  const data = await res.json() as any
  const rawResponse = data.choices?.[0]?.message?.content ?? ''
  const tokensUsed = data.usage?.total_tokens ?? 0

  return { decision: parseDecision(rawResponse), rawResponse, latencyMs, tokensUsed }
}

// ── Risk Controls ─────────────────────────────────────────────

function checkRiskLimits(
  decision: TradeDecision,
  agent: { riskMaxExposure: number; riskMaxLeverage: number; riskMaxPositions: number; riskStopLossReq: boolean },
  openPositionCount: number,
  currentExposurePct: number
): { passed: boolean; reason?: string } {
  if (decision.action === 'hold' || decision.action === 'close') return { passed: true }

  if (openPositionCount >= agent.riskMaxPositions)
    return { passed: false, reason: `Max positions (${agent.riskMaxPositions}) reached` }

  if (currentExposurePct + decision.size_pct > agent.riskMaxExposure)
    return { passed: false, reason: `Exposure cap ${(agent.riskMaxExposure * 100).toFixed(0)}% breached` }

  const lev = decision.leverage ?? 1
  if (lev > agent.riskMaxLeverage)
    return { passed: false, reason: `Leverage ${lev}x exceeds max ${agent.riskMaxLeverage}x` }

  if (agent.riskStopLossReq && (!decision.stop_loss_pct || decision.stop_loss_pct <= 0))
    return { passed: false, reason: 'Stop-loss required but not provided' }

  return { passed: true }
}

// ── Round Runner ──────────────────────────────────────────────

export async function runArenaRound(seasonId: string): Promise<{ roundId: string; decisionsCount: number }> {
  checkKillSwitch()

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

  const pairs = season.tradingPairs.split(',').map(p => `${p.trim()}-USD`)
  const marketData = await fetchMarketData(pairs)

  const lastRound = await prisma.arenaRound.findFirst({
    where: { seasonId },
    orderBy: { roundNumber: 'desc' },
  })
  const round = await prisma.arenaRound.create({
    data: {
      seasonId,
      roundNumber: (lastRound?.roundNumber ?? 0) + 1,
      marketData: marketData as any,
      status: 'in_progress',
    },
  })

  let decisionsCount = 0

  await Promise.allSettled(
    season.entries.map(async (entry) => {
      const agent = entry.agent

      try {
        await checkAgentHalt(agent.tag, agent.haltedUntil)
      } catch (haltErr) {
        await prisma.arenaRoundDecision.create({
          data: {
            roundId: round.id, entryId: entry.id,
            action: 'hold', reasoning: String(haltErr),
            riskCheckPassed: false, rejectionReason: String(haltErr),
          },
        })
        return
      }

      const openPositionCount = entry.trades.length
      const exposurePct = entry.trades.reduce((s: number, t: any) => s + t.sizePct, 0)
      const envelope = buildTrustedEnvelope(agent.tag, marketData, entry.trades, entry.currentBalance)

      let decResult: { decision: TradeDecision; rawResponse: string; latencyMs: number; tokensUsed?: number }

      try {
        const sessionKey = readAgentSessionKey(agent.tag)
        if (agent.executionPath === 'openclaw' && sessionKey) {
          const r = await getDecisionOpenClaw(agent.tag, sessionKey, envelope)
          decResult = { ...r, tokensUsed: undefined }
        } else {
          decResult = await getDecisionDirect(agent.modelId, agent.strategyPrompt, envelope)
        }
      } catch (err) {
        await prisma.arenaRoundDecision.create({
          data: {
            roundId: round.id, entryId: entry.id,
            action: 'hold', reasoning: `Decision error: ${err}`,
            riskCheckPassed: false, rejectionReason: String(err),
          },
        })
        return
      }

      const { decision, rawResponse, latencyMs, tokensUsed } = decResult
      const risk = checkRiskLimits(decision, agent, openPositionCount, exposurePct)

      await prisma.arenaRoundDecision.create({
        data: {
          roundId: round.id, entryId: entry.id,
          action: decision.action, pair: decision.pair,
          sizePct: decision.size_pct, confidence: decision.confidence,
          reasoning: decision.reasoning,
          rawResponse,
          latencyMs, tokensUsed,
          riskCheckPassed: risk.passed,
          rejectionReason: risk.reason,
        },
      })

      if (risk.passed && decision.action !== 'hold') {
        const price = marketData.prices[decision.pair] ?? 0
        await prisma.arenaTrade.create({
          data: {
            entryId: entry.id, roundId: round.id,
            pair: decision.pair, side: decision.action,
            entryPrice: price,
            size: entry.currentBalance * decision.size_pct,
            sizePct: decision.size_pct,
            leverage: decision.leverage ?? 1,
            stopLoss: decision.action === 'long'
              ? price * (1 - decision.stop_loss_pct)
              : price * (1 + decision.stop_loss_pct),
            takeProfit: decision.action === 'long'
              ? price * (1 + decision.take_profit_pct)
              : price * (1 - decision.take_profit_pct),
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

  await prisma.arenaRound.update({
    where: { id: round.id },
    data: { status: 'completed', completedAt: new Date() },
  })

  return { roundId: round.id, decisionsCount }
}

function parseDecision(content: string): TradeDecision {
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  const raw = JSON.parse(match[0]) as Partial<TradeDecision>
  return {
    action: (['long','short','close','hold'].includes(raw.action ?? '')) ? raw.action as TradeDecision['action'] : 'hold',
    pair: raw.pair ?? 'BTC-USD',
    size_pct: Math.min(Math.max(raw.size_pct ?? 0.05, 0.01), 0.5),
    confidence: Math.min(Math.max(raw.confidence ?? 0.5, 0), 1),
    reasoning: String(raw.reasoning ?? 'No reasoning').substring(0, 500),
    stop_loss_pct: Math.min(Math.max(raw.stop_loss_pct ?? 0.05, 0.01), 0.2),
    take_profit_pct: Math.min(Math.max(raw.take_profit_pct ?? 0.15, 0.01), 0.5),
    leverage: Math.min(Math.max(Math.round(raw.leverage ?? 1), 1), 20),
  }
}

interface LocalTrade {
  pair: string; side: string; entryPrice: number; sizePct: number; stopLoss: number | null
}
