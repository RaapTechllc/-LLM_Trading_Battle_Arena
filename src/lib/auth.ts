import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Inject user.id into session for easy access
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create starting balance ($10K paper) on first login
      try {
        await prisma.accountBalance.create({
          data: {
            userId: user.id!,
          },
        })
        
        // Audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id!,
            action: "USER_REGISTERED",
            entityType: "user",
            entityId: user.id!,
            details: {
              email: user.email,
              initialBalance: 10000,
            },
          },
        })
      } catch (error) {
        console.error("Failed to create account balance for new user:", error)
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 24 * 60 * 60, // 24 hours
  },
})

/**
 * Helper to get server session - use in server components and API routes
 * @example
 * const session = await getServerSession()
 * if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
 */
export async function getServerSession() {
  return await auth()
}
