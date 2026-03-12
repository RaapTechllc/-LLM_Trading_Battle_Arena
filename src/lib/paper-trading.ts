/**
 * Paper Trading Service
 * Fetches real market prices and executes paper trades with simulated slippage.
 * Uses CoinGecko free API for price data.
 */

import { prisma } from '@/lib/prisma'

interface PriceData {
  [coinId: string]: {
    usd: number
    usd_24h_change?: number
  }
}

interface ExecutionResult {
  success: boolean
  tradeId?: string
  executedPrice: number
  intendedPrice: number
  slippage: number
  latencyMs: number
  externalOrderId: string
  error?: string
}

interface PositionResult {
  success: boolean
  tradeId?: string
  error?: string
  execution?: ExecutionResult
}

// Map trading pairs to CoinGecko IDs
const PAIR_TO_COINGECKO: Record<string, string> = {
  'BTC': 'bitcoin',
  'BTC-USD': 'bitcoin',
  'ETH': 'ethereum',
  'ETH-USD': 'ethereum',
  'SOL': 'solana',
  'SOL-USD': 'solana',
  'DOGE': 'dogecoin',
  'DOGE-USD': 'dogecoin',
  'AVAX': 'avalanche-2',
  'AVAX-USD': 'avalanche-2',
}

export class PaperTradingService {
  private priceCache: Map<string, { price: number; timestamp: number }> = new Map()
  private readonly CACHE_TTL_MS = 30_000 // 30s cache
  private readonly SLIPPAGE_MIN = 0.0005 // 0.05%
  private readonly SLIPPAGE_MAX = 0.001  // 0.1%

  /**
   * Fetch real market prices from CoinGecko
   */
  async fetchPrices(pairs: string[]): Promise<Record<string, number>> {
    const now = Date.now()
    const result: Record<string, number> = {}
    const toFetch: string[] = []

    // Check cache first
    for (const pair of pairs) {
      const cached = this.priceCache.get(pair)
      if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
        result[pair] = cached.price
      } else {
        toFetch.push(pair)
      }
    }

    if (toFetch.length === 0) return result

    // Map pairs to CoinGecko IDs
    const coinIds = toFetch
      .map(p => PAIR_TO_COINGECKO[p])
      .filter(Boolean)

    if (coinIds.length === 0) return result

    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10_000),
      })

      if (!res.ok) {
        console.error(`[PaperTrading] CoinGecko API error: ${res.status}`)
        return result
      }

      const data = await res.json() as PriceData

      for (const pair of toFetch) {
        const geckoId = PAIR_TO_COINGECKO[pair]
        if (geckoId && data[geckoId]?.usd) {
          const price = data[geckoId].usd
          result[pair] = price
          this.priceCache.set(pair, { price, timestamp: now })
        }
      }
    } catch (err) {
      console.error('[PaperTrading] Price fetch error:', err)
    }

    return result
  }

  /**
   * Simulate slippage on a trade (0.05-0.1%)
   */
  private simulateSlippage(price: number, side: 'long' | 'short'): { executedPrice: number; slippage: number } {
    const slippagePct = this.SLIPPAGE_MIN + Math.random() * (this.SLIPPAGE_MAX - this.SLIPPAGE_MIN)
    // Slippage always works against the trader
    const direction = side === 'long' ? 1 : -1
    const executedPrice = price * (1 + direction * slippagePct)
    const slippage = Math.abs(executedPrice - price)

    return { executedPrice: Math.round(executedPrice * 100) / 100, slippage }
  }

  /**
   * Generate a unique paper order ID
   */
  private generateOrderId(): string {
    return `PAPER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  }

  /**
   * Open a paper position at real market prices
   */
  async openPosition(
    entryId: string,
    roundId: string | null,
    pair: string,
    side: 'long' | 'short',
    size: number,
    sizePct: number,
    leverage: number,
    stopLossPct: number,
    takeProfitPct: number,
    reasoning: string,
    confidence: number,
    riskCheckPassed: boolean
  ): Promise<PositionResult> {
    const start = Date.now()

    try {
      // Fetch real price
      const prices = await this.fetchPrices([pair])
      const realPrice = prices[pair]
      if (!realPrice) {
        return { success: false, error: `No price available for ${pair}` }
      }

      // Simulate execution with slippage
      const { executedPrice, slippage } = this.simulateSlippage(realPrice, side)
      const latencyMs = Date.now() - start
      const externalOrderId = this.generateOrderId()

      // Calculate stop loss and take profit based on executed price
      const stopLoss = side === 'long'
        ? executedPrice * (1 - stopLossPct)
        : executedPrice * (1 + stopLossPct)
      const takeProfit = side === 'long'
        ? executedPrice * (1 + takeProfitPct)
        : executedPrice * (1 - takeProfitPct)

      // Record trade with paper execution details
      const trade = await prisma.arenaTrade.create({
        data: {
          entryId,
          roundId,
          pair,
          side,
          entryPrice: executedPrice, // Use executed price (with slippage)
          size,
          sizePct,
          leverage,
          stopLoss,
          takeProfit,
          reasoning,
          confidence,
          riskCheckPassed,
          executionMode: 'paper',
          externalOrderId,
          executedPrice,
          slippage,
          status: 'open',
        },
      })

      console.log(
        `[PaperTrading] ${side.toUpperCase()} ${pair} @ $${executedPrice.toLocaleString()} ` +
        `(intended: $${realPrice.toLocaleString()}, slippage: $${slippage.toFixed(2)}, ` +
        `latency: ${latencyMs}ms, orderId: ${externalOrderId})`
      )

      return {
        success: true,
        tradeId: trade.id,
        execution: {
          success: true,
          tradeId: trade.id,
          executedPrice,
          intendedPrice: realPrice,
          slippage,
          latencyMs,
          externalOrderId,
        },
      }
    } catch (err) {
      console.error('[PaperTrading] openPosition error:', err)
      return { success: false, error: String(err) }
    }
  }

  /**
   * Close a paper position at real market prices
   */
  async closePosition(tradeId: string): Promise<PositionResult> {
    const start = Date.now()

    try {
      const trade = await prisma.arenaTrade.findUnique({
        where: { id: tradeId },
        include: { entry: true },
      })

      if (!trade) return { success: false, error: `Trade ${tradeId} not found` }
      if (trade.status !== 'open') return { success: false, error: `Trade ${tradeId} is ${trade.status}, not open` }

      // Fetch current price
      const prices = await this.fetchPrices([trade.pair])
      const currentPrice = prices[trade.pair]
      if (!currentPrice) return { success: false, error: `No price for ${trade.pair}` }

      // Simulate exit slippage (opposite direction)
      const exitSide = trade.side === 'long' ? 'short' : 'long'
      const { executedPrice: exitPrice, slippage } = this.simulateSlippage(currentPrice, exitSide as 'long' | 'short')
      const latencyMs = Date.now() - start
      const externalOrderId = this.generateOrderId()

      // Calculate P&L
      const priceDiff = trade.side === 'long'
        ? exitPrice - trade.entryPrice
        : trade.entryPrice - exitPrice
      const pnl = (priceDiff / trade.entryPrice) * trade.size * trade.leverage
      const pnlPct = (priceDiff / trade.entryPrice) * 100 * trade.leverage

      // Update trade
      await prisma.arenaTrade.update({
        where: { id: tradeId },
        data: {
          exitPrice,
          pnl,
          pnlPct,
          status: 'closed',
          closedAt: new Date(),
          executedPrice: exitPrice,
          slippage: (trade.slippage ?? 0) + slippage, // Cumulative slippage
          externalOrderId: `${trade.externalOrderId}|${externalOrderId}`, // Both order IDs
        },
      })

      // Update entry balance
      await prisma.arenaSeasonEntry.update({
        where: { id: trade.entryId },
        data: {
          currentBalance: { increment: pnl },
          totalPnl: { increment: pnl },
          realizedPnl: { increment: pnl },
          totalTrades: { increment: 1 },
          ...(pnl >= 0 ? { winCount: { increment: 1 } } : { lossCount: { increment: 1 } }),
        },
      })

      console.log(
        `[PaperTrading] CLOSED ${trade.side.toUpperCase()} ${trade.pair} @ $${exitPrice.toLocaleString()} ` +
        `PnL: $${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%) latency: ${latencyMs}ms`
      )

      return {
        success: true,
        tradeId,
        execution: {
          success: true,
          tradeId,
          executedPrice: exitPrice,
          intendedPrice: currentPrice,
          slippage,
          latencyMs,
          externalOrderId,
        },
      }
    } catch (err) {
      console.error('[PaperTrading] closePosition error:', err)
      return { success: false, error: String(err) }
    }
  }

  /**
   * Check stop losses and take profits against real prices
   */
  async checkStopsAndTargets(seasonId: string): Promise<{ closed: number; errors: number }> {
    const openTrades = await prisma.arenaTrade.findMany({
      where: {
        status: 'open',
        executionMode: 'paper',
        entry: { seasonId },
      },
    })

    if (openTrades.length === 0) return { closed: 0, errors: 0 }

    const pairs = [...new Set(openTrades.map(t => t.pair))]
    const prices = await this.fetchPrices(pairs)

    let closed = 0
    let errors = 0

    for (const trade of openTrades) {
      const price = prices[trade.pair]
      if (!price) continue

      let shouldClose = false
      let closeReason = ''

      // Check stop loss
      if (trade.stopLoss) {
        if (trade.side === 'long' && price <= trade.stopLoss) {
          shouldClose = true
          closeReason = 'stop_loss_hit'
        } else if (trade.side === 'short' && price >= trade.stopLoss) {
          shouldClose = true
          closeReason = 'stop_loss_hit'
        }
      }

      // Check take profit
      if (trade.takeProfit && !shouldClose) {
        if (trade.side === 'long' && price >= trade.takeProfit) {
          shouldClose = true
          closeReason = 'take_profit_hit'
        } else if (trade.side === 'short' && price <= trade.takeProfit) {
          shouldClose = true
          closeReason = 'take_profit_hit'
        }
      }

      if (shouldClose) {
        const result = await this.closePosition(trade.id)
        if (result.success) {
          console.log(`[PaperTrading] Auto-closed trade ${trade.id}: ${closeReason}`)
          closed++
        } else {
          errors++
        }
      }
    }

    return { closed, errors }
  }
}

// Singleton instance
export const paperTradingService = new PaperTradingService()
