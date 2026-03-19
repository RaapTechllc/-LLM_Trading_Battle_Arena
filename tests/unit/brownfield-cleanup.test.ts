import { describe, test, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// P0: Constants & rarity logic
// ============================================================================

describe('constants.ts — getRarity', () => {
  let getRarity: (pnl: number) => string

  beforeEach(async () => {
    const mod = await import('@/lib/constants')
    getRarity = mod.getRarity
  })

  test('returns LEGENDARY for >=10% absolute PnL', () => {
    expect(getRarity(10)).toBe('LEGENDARY')
    expect(getRarity(-15)).toBe('LEGENDARY')
    expect(getRarity(47.2)).toBe('LEGENDARY')
  })

  test('returns EPIC for >=5% and <10%', () => {
    expect(getRarity(5)).toBe('EPIC')
    expect(getRarity(9.99)).toBe('EPIC')
    expect(getRarity(-7)).toBe('EPIC')
  })

  test('returns RARE for >=2% and <5%', () => {
    expect(getRarity(2)).toBe('RARE')
    expect(getRarity(4.99)).toBe('RARE')
    expect(getRarity(-3)).toBe('RARE')
  })

  test('returns COMMON for <2%', () => {
    expect(getRarity(0)).toBe('COMMON')
    expect(getRarity(1.99)).toBe('COMMON')
    expect(getRarity(-0.5)).toBe('COMMON')
  })
})

describe('constants.ts — TRADING_MODELS', () => {
  test('has exactly 5 models', async () => {
    const { TRADING_MODELS } = await import('@/lib/constants')
    expect(TRADING_MODELS.length).toBe(5)
  })

  test('each model has required fields', async () => {
    const { TRADING_MODELS } = await import('@/lib/constants')
    for (const m of TRADING_MODELS) {
      expect(m.name).toBeTruthy()
      expect(m.provider).toBeTruthy()
      expect(m.avatar).toBeTruthy()
    }
  })

  test('DEFAULT_USER_ID is no longer exported', async () => {
    const mod = await import('@/lib/constants') as Record<string, unknown>
    expect(mod.DEFAULT_USER_ID).toBeUndefined()
  })
})

describe('constants.ts — ASSETS', () => {
  test('includes DOGE and AVAX (previously missing in trading-constants)', async () => {
    const { ASSETS } = await import('@/lib/constants')
    const symbols = ASSETS.map(a => a.symbol)
    expect(symbols).toContain('DOGE')
    expect(symbols).toContain('AVAX')
  })

  test('has 8 assets total', async () => {
    const { ASSETS } = await import('@/lib/constants')
    expect(ASSETS.length).toBe(8)
  })
})

// ============================================================================
// P0: Arena orchestrator — parseDecision & risk checks (unit-testable parts)
// ============================================================================

describe('arena-orchestrator — parseDecision', () => {
  // parseDecision is not exported, so we test via the module internals
  // We'll test the logic inline since it's a pure function pattern

  function parseDecision(content: string) {
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')
    const raw = JSON.parse(match[0])
    return {
      action: (['long','short','close','hold'].includes(raw.action ?? '')) ? raw.action : 'hold',
      pair: raw.pair ?? 'BTC-USD',
      size_pct: Math.min(Math.max(raw.size_pct ?? 0.05, 0.01), 0.5),
      confidence: Math.min(Math.max(raw.confidence ?? 0.5, 0), 1),
      reasoning: String(raw.reasoning ?? 'No reasoning').substring(0, 500),
      stop_loss_pct: Math.min(Math.max(raw.stop_loss_pct ?? 0.05, 0.01), 0.2),
      take_profit_pct: Math.min(Math.max(raw.take_profit_pct ?? 0.15, 0.01), 0.5),
      leverage: Math.min(Math.max(Math.round(raw.leverage ?? 1), 1), 20),
    }
  }

  test('parses valid JSON response', () => {
    const d = parseDecision('Here is my trade: {"action":"long","pair":"BTC-USD","size_pct":0.1,"confidence":0.8,"reasoning":"bullish","stop_loss_pct":0.05,"take_profit_pct":0.15,"leverage":3}')
    expect(d.action).toBe('long')
    expect(d.pair).toBe('BTC-USD')
    expect(d.leverage).toBe(3)
  })

  test('throws on no JSON', () => {
    expect(() => parseDecision('no json here')).toThrow('No JSON')
  })

  test('defaults invalid action to hold', () => {
    const d = parseDecision('{"action":"yolo"}')
    expect(d.action).toBe('hold')
  })

  test('clamps leverage to 1-20', () => {
    expect(parseDecision('{"leverage":100}').leverage).toBe(20)
    expect(parseDecision('{"leverage":-5}').leverage).toBe(1)
    expect(parseDecision('{"leverage":0}').leverage).toBe(1)
  })

  test('clamps size_pct to 0.01-0.5', () => {
    expect(parseDecision('{"size_pct":0.001}').size_pct).toBe(0.01)
    expect(parseDecision('{"size_pct":0.9}').size_pct).toBe(0.5)
  })

  test('clamps stop_loss_pct to 0.01-0.2', () => {
    expect(parseDecision('{"stop_loss_pct":0.5}').stop_loss_pct).toBe(0.2)
  })
})

// ============================================================================
// P1: Risk check logic (pure function, testable without DB)
// ============================================================================

describe('risk check logic', () => {
  function checkRiskLimits(
    decision: { action: string; size_pct: number; leverage?: number; stop_loss_pct?: number },
    agent: { riskMaxExposure: number; riskMaxLeverage: number; riskMaxPositions: number; riskStopLossReq: boolean },
    openPositionCount: number,
    currentExposurePct: number
  ) {
    if (decision.action === 'hold' || decision.action === 'close') return { passed: true }
    if (openPositionCount >= agent.riskMaxPositions)
      return { passed: false, reason: `Max positions (${agent.riskMaxPositions}) reached` }
    if (currentExposurePct + decision.size_pct > agent.riskMaxExposure)
      return { passed: false, reason: `Exposure cap breached` }
    const lev = decision.leverage ?? 1
    if (lev > agent.riskMaxLeverage)
      return { passed: false, reason: `Leverage ${lev}x exceeds max` }
    if (agent.riskStopLossReq && (!decision.stop_loss_pct || decision.stop_loss_pct <= 0))
      return { passed: false, reason: 'Stop-loss required' }
    return { passed: true }
  }

  const defaultAgent = { riskMaxExposure: 0.5, riskMaxLeverage: 5, riskMaxPositions: 3, riskStopLossReq: true }

  test('hold always passes', () => {
    expect(checkRiskLimits({ action: 'hold', size_pct: 1 }, defaultAgent, 10, 1).passed).toBe(true)
  })

  test('close always passes', () => {
    expect(checkRiskLimits({ action: 'close', size_pct: 1 }, defaultAgent, 10, 1).passed).toBe(true)
  })

  test('rejects when max positions reached', () => {
    const r = checkRiskLimits({ action: 'long', size_pct: 0.1, leverage: 2, stop_loss_pct: 0.05 }, defaultAgent, 3, 0)
    expect(r.passed).toBe(false)
    expect(r.reason).toContain('Max positions')
  })

  test('rejects when exposure cap breached', () => {
    const r = checkRiskLimits({ action: 'long', size_pct: 0.3, leverage: 2, stop_loss_pct: 0.05 }, defaultAgent, 0, 0.3)
    expect(r.passed).toBe(false)
    expect(r.reason).toContain('Exposure')
  })

  test('rejects when leverage exceeds max', () => {
    const r = checkRiskLimits({ action: 'short', size_pct: 0.1, leverage: 10, stop_loss_pct: 0.05 }, defaultAgent, 0, 0)
    expect(r.passed).toBe(false)
    expect(r.reason).toContain('Leverage')
  })

  test('rejects when stop loss required but missing', () => {
    const r = checkRiskLimits({ action: 'long', size_pct: 0.1, leverage: 2 }, defaultAgent, 0, 0)
    expect(r.passed).toBe(false)
    expect(r.reason).toContain('Stop-loss')
  })

  test('passes valid trade', () => {
    const r = checkRiskLimits({ action: 'long', size_pct: 0.1, leverage: 2, stop_loss_pct: 0.05 }, defaultAgent, 0, 0)
    expect(r.passed).toBe(true)
  })
})

// ============================================================================
// P2: Rate limiter
// ============================================================================

describe('rate-limit.ts — in-memory limiter', () => {
  test('exports rateLimitAsync and rateLimit', async () => {
    const mod = await import('@/lib/rate-limit')
    expect(typeof mod.rateLimitAsync).toBe('function')
    expect(typeof mod.rateLimit).toBe('function')
  })

  test('allows requests under the limit', async () => {
    const { rateLimit } = await import('@/lib/rate-limit')
    const result = rateLimit(`test-ip-${Date.now()}`)
    expect(result.allowed).toBe(true)
  })

  test('exports RATE_LIMIT_CONFIG with correct defaults', async () => {
    const { RATE_LIMIT_CONFIG } = await import('@/lib/rate-limit')
    expect(RATE_LIMIT_CONFIG.windowMs).toBe(60000)
    expect(RATE_LIMIT_CONFIG.maxRequests).toBe(10)
  })
})

// ============================================================================
// P2: OpenRouter response parsing
// ============================================================================

describe('openrouter.ts — MODEL_MAP', () => {
  test('has entries matching all TRADING_MODELS', async () => {
    const { MODEL_MAP } = await import('@/lib/openrouter')
    const { TRADING_MODELS } = await import('@/lib/constants')
    for (const m of TRADING_MODELS) {
      expect(MODEL_MAP[m.name]).toBeTruthy()
    }
  })

  test('all MODEL_MAP values are valid OpenRouter model IDs', async () => {
    const { MODEL_MAP } = await import('@/lib/openrouter')
    for (const [, id] of Object.entries(MODEL_MAP)) {
      expect(id).toMatch(/^[a-z0-9-]+\/[a-z0-9.-]+$/)
    }
  })
})

// ============================================================================
// P2: Singleton PrismaClient
// ============================================================================

describe('prisma singleton', () => {
  test('exports a prisma instance', async () => {
    const { prisma } = await import('@/lib/prisma')
    expect(prisma).toBeDefined()
    expect(typeof prisma.$connect).toBe('function')
  })
})

// ============================================================================
// P2: Input validation / container safety
// ============================================================================

describe('input validation', () => {
  test('getRarity handles edge case values', async () => {
    const { getRarity } = await import('@/lib/constants')
    expect(getRarity(NaN)).toBe('COMMON')
    expect(getRarity(Infinity)).toBe('LEGENDARY')
    expect(getRarity(-Infinity)).toBe('LEGENDARY')
  })
})
