import { Prisma } from "@prisma/client"
import { OrderParams } from "./TradingService"
import { prisma } from "@/lib/prisma"

export interface RiskCheckResult {
  approved: boolean
  reason?: string
  checks?: Array<{ name: string; passed: boolean; reason?: string }>
}

/**
 * RiskManager - Trading risk controls
 * Phase 1: Stub implementation with basic checks
 * Phase 2: Full risk control suite
 */
export class RiskManager {
  // Per-trade limits (from spec section 7)
  static MAX_POSITION_PCT = 0.10 // 10% of equity per position
  static MAX_LEVERAGE = 3 // 3x maximum
  static MAX_OPEN_POSITIONS = 20 // Position count cap

  // Account limits
  static MAX_DAILY_LOSS_PCT = 0.05 // 5% daily loss → halt trading
  static MAX_DRAWDOWN_PCT = 0.20 // 20% max drawdown → liquidation warning
  static CIRCUIT_BREAKER_PCT = 0.30 // 30% drawdown → force close all

  /**
   * Check if order is allowed based on risk limits
   */
  async checkOrderAllowed(
    userId: string,
    params: OrderParams
  ): Promise<RiskCheckResult> {
    const checks = await Promise.all([
      this.checkPositionSize(userId, params),
      this.checkDailyLoss(userId),
      this.checkConcentration(userId, params.symbol),
      this.checkOpenPositionCount(userId),
    ])

    const failures = checks.filter((c) => !c.passed)

    return {
      approved: failures.length === 0,
      reason: failures.map((f) => f.reason).join("; "),
      checks,
    }
  }

  /**
   * Check if position size is within limits
   */
  private async checkPositionSize(
    userId: string,
    params: OrderParams
  ): Promise<{ name: string; passed: boolean; reason?: string }> {
    const balance = await prisma.accountBalance.findUnique({
      where: { userId },
    })

    if (!balance) {
      return {
        name: "position_size",
        passed: false,
        reason: "Account balance not found",
      }
    }

    const positionValue = params.quantity * params.estimatedPrice
    const maxAllowed = balance.equityValue.toNumber() * RiskManager.MAX_POSITION_PCT

    if (positionValue > maxAllowed) {
      return {
        name: "position_size",
        passed: false,
        reason: `Position size ${positionValue} exceeds ${RiskManager.MAX_POSITION_PCT * 100}% limit (${maxAllowed})`,
      }
    }

    return { name: "position_size", passed: true }
  }

  /**
   * Check daily loss limit
   */
  async checkDailyLoss(
    userId: string
  ): Promise<{ name: string; passed: boolean; reason?: string }> {
    const stats = await this.getDailyStats(userId)

    if (stats.dailyLossPct >= RiskManager.MAX_DAILY_LOSS_PCT) {
      return {
        name: "daily_loss",
        passed: false,
        reason: `Daily loss ${(stats.dailyLossPct * 100).toFixed(2)}% exceeds ${RiskManager.MAX_DAILY_LOSS_PCT * 100}% limit`,
      }
    }

    return { name: "daily_loss", passed: true }
  }

  /**
   * Check symbol concentration limit
   */
  async checkConcentration(
    userId: string,
    symbol: string
  ): Promise<{ name: string; passed: boolean; reason?: string }> {
    // Stub: For Phase 1, always pass
    // Phase 2: Check if too much exposure to single symbol
    return { name: "concentration", passed: true }
  }

  /**
   * Check open position count limit
   */
  private async checkOpenPositionCount(
    userId: string
  ): Promise<{ name: string; passed: boolean; reason?: string }> {
    const count = await prisma.position.count({
      where: {
        userId,
        status: "OPEN",
      },
    })

    if (count >= RiskManager.MAX_OPEN_POSITIONS) {
      return {
        name: "position_count",
        passed: false,
        reason: `Open position count ${count} exceeds limit ${RiskManager.MAX_OPEN_POSITIONS}`,
      }
    }

    return { name: "position_count", passed: true }
  }

  /**
   * Get daily trading statistics
   */
  private async getDailyStats(userId: string): Promise<{
    dailyPnl: number
    dailyLossPct: number
  }> {
    // Stub: For Phase 1, return zeros
    // Phase 2: Calculate real daily P&L from positions/orders
    return {
      dailyPnl: 0,
      dailyLossPct: 0,
    }
  }

  /**
   * Check if trading should be halted for user
   */
  async shouldHaltTrading(userId: string): Promise<boolean> {
    const stats = await this.getDailyStats(userId)
    return stats.dailyLossPct >= RiskManager.MAX_DAILY_LOSS_PCT
  }

  /**
   * Check circuit breaker (force close all positions)
   */
  async checkCircuitBreaker(userId: string): Promise<boolean> {
    const balance = await prisma.accountBalance.findUnique({
      where: { userId },
    })

    if (!balance) return false

    const startingCapital = 10000 // From spec
    const drawdownPct = 1 - balance.equityValue.toNumber() / startingCapital

    if (drawdownPct >= RiskManager.CIRCUIT_BREAKER_PCT) {
      await this.forceCloseAll(userId, "CIRCUIT_BREAKER")
      return true
    }

    return false
  }

  /**
   * Force close all positions (emergency)
   */
  private async forceCloseAll(
    userId: string,
    reason: string
  ): Promise<void> {
    // Stub: Mark all positions as closed
    // Phase 2: Submit close orders to broker
    await prisma.position.updateMany({
      where: {
        userId,
        status: "OPEN",
      },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    })

    // Log risk event
    await prisma.riskEvent.create({
      data: {
        userId,
        eventType: reason,
        severity: "LIQUIDATION",
        details: {
          reason,
          timestamp: new Date().toISOString(),
        },
      },
    })
  }
}
