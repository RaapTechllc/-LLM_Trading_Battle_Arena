import { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extend session to include user.id
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}
