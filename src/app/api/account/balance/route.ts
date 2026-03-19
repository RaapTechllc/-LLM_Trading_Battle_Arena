import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/account/balance
 * Returns user's account balance
 */
export async function GET() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const balance = await prisma.accountBalance.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  if (!balance) {
    return NextResponse.json(
      { error: "Account balance not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    cashBalance: balance.cashBalance.toNumber(),
    equityValue: balance.equityValue.toNumber(),
    buyingPower: balance.buyingPower.toNumber(),
    totalPnl: balance.totalPnl.toNumber(),
    updatedAt: balance.updatedAt,
  })
}
