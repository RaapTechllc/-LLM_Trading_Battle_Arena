import { PrismaClient, Prisma } from "@prisma/client"

const prisma = new PrismaClient()

export interface AuditLogEntry {
  userId?: string
  action: string
  entityType: string
  entityId: string
  details: any
  ipAddress?: string
}

/**
 * AuditLogger - Centralized audit logging
 * All trade operations, auth events, and risk events are logged here
 * Append-only: No UPDATE or DELETE on audit_logs table
 */
export class AuditLogger {
  /**
   * Write an audit log entry
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId || null,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          details: entry.details as Prisma.InputJsonValue,
          ipAddress: entry.ipAddress || null,
        },
      })
    } catch (error) {
      // Never throw in audit logger - log to stderr but don't fail the operation
      console.error("[AuditLogger] Failed to write audit log:", error, entry)
    }
  }

  /**
   * Log a risk event (convenience method)
   */
  async logRiskEvent(
    userId: string,
    details: { type: string; reason: string; params?: any }
  ): Promise<void> {
    await this.log({
      userId,
      action: "RISK_CHECK_FAILED",
      entityType: "risk_event",
      entityId: userId, // Use userId as entityId for risk events
      details,
    })
  }

  /**
   * Log an authentication event
   */
  async logAuthEvent(
    userId: string | null,
    action: "LOGIN" | "LOGOUT" | "REGISTER" | "AUTH_FAILED",
    details: any,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      userId: userId || undefined,
      action,
      entityType: "auth",
      entityId: userId || "anonymous",
      details,
      ipAddress,
    })
  }

  /**
   * Get audit logs for a user (with optional filters)
   */
  async getUserLogs(
    userId: string,
    options?: {
      action?: string
      entityType?: string
      limit?: number
      offset?: number
    }
  ) {
    return await prisma.auditLog.findMany({
      where: {
        userId,
        ...(options?.action && { action: options.action }),
        ...(options?.entityType && { entityType: options.entityType }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    })
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityLogs(
    entityType: string,
    entityId: string,
    limit = 100
  ) {
    return await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })
  }
}
