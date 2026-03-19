import { PrismaClient, Prisma } from "@prisma/client"
import { RiskManager } from "./RiskManager"
import { AuditLogger } from "./AuditLogger"

const prisma = new PrismaClient()

export interface OrderParams {
  symbol: string
  side: "BUY" | "SELL"
  orderType: "MARKET" | "LIMIT" | "STOP"
  quantity: number
  limitPrice?: number
  estimatedPrice: number
  modelId?: string
}

export class InsufficientFundsError extends Error {
  constructor(available: number, required: number) {
    super(`Insufficient funds: ${available} available, ${required} required`)
    this.name = "InsufficientFundsError"
  }
}

export class RiskLimitError extends Error {
  constructor(reason: string) {
    super(`Risk limit exceeded: ${reason}`)
    this.name = "RiskLimitError"
  }
}

/**
 * TradingService - Core trading operations
 * Phase 1: Stub implementation (no broker integration yet)
 * Phase 2: Will integrate with Alpaca API
 */
export class TradingService {
  private riskManager: RiskManager
  private auditLogger: AuditLogger

  constructor() {
    this.riskManager = new RiskManager()
    this.auditLogger = new AuditLogger()
  }

  /**
   * Submit a new order
   * TODO Phase 2: Integrate with Alpaca API
   */
  async createOrder(userId: string, params: OrderParams, ipAddress?: string) {
    // 1. Validate user balance
    const balance = await this.getBalance(userId)
    if (!balance) {
      throw new Error("Account balance not found")
    }

    const cost = new Prisma.Decimal(params.quantity * params.estimatedPrice)
    if (cost.greaterThan(balance.buyingPower)) {
      throw new InsufficientFundsError(
        balance.buyingPower.toNumber(),
        cost.toNumber()
      )
    }

    // 2. Risk check
    const riskResult = await this.riskManager.checkOrderAllowed(userId, params)
    if (!riskResult.approved) {
      const reason = riskResult.reason || "Unknown risk limit violation"
      await this.auditLogger.logRiskEvent(userId, {
        type: "ORDER_REJECTED",
        reason,
        params,
      })
      throw new RiskLimitError(reason)
    }

    // 3. Create order (stub - no broker integration yet)
    const order = await prisma.order.create({
      data: {
        userId,
        symbol: params.symbol,
        side: params.side,
        orderType: params.orderType,
        quantity: new Prisma.Decimal(params.quantity),
        limitPrice: params.limitPrice ? new Prisma.Decimal(params.limitPrice) : null,
        status: "PENDING",
        // brokerOrderId will be set in Phase 2
      },
    })

    // 4. Audit log
    await this.auditLogger.log({
      userId,
      action: "ORDER_SUBMIT",
      entityType: "order",
      entityId: order.id,
      details: params,
      ipAddress,
    })

    return order
  }

  /**
   * Close an open position
   * TODO Phase 2: Submit close order to Alpaca
   */
  async closePosition(userId: string, positionId: string, ipAddress?: string) {
    const position = await prisma.position.findUnique({
      where: { id: positionId },
    })

    if (!position) {
      throw new Error("Position not found")
    }

    if (position.userId !== userId) {
      throw new Error("Unauthorized: position does not belong to user")
    }

    if (position.status !== "OPEN") {
      throw new Error("Position is not open")
    }

    // Stub: Mark as closed (Phase 2 will submit close order to broker)
    await prisma.position.update({
      where: { id: positionId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    })

    await this.auditLogger.log({
      userId,
      action: "POSITION_CLOSE",
      entityType: "position",
      entityId: positionId,
      details: { positionId },
      ipAddress,
    })

    return position
  }

  /**
   * Get user's open positions
   */
  async getPositions(userId: string) {
    return await prisma.position.findMany({
      where: {
        userId,
        status: "OPEN",
      },
      include: {
        model: true,
        orders: true,
      },
      orderBy: {
        openedAt: "desc",
      },
    })
  }

  /**
   * Get user's account balance
   */
  async getBalance(userId: string) {
    return await prisma.accountBalance.findUnique({
      where: { userId },
    })
  }

  /**
   * Sync positions from broker (Phase 2)
   * TODO: Pull positions from Alpaca and reconcile with DB
   */
  async syncPositions(userId: string): Promise<void> {
    // Stub - will implement in Phase 2
    console.log(`[TradingService] syncPositions stub called for user ${userId}`)
  }
}
