import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: AuthOptions = {
  // No PrismaAdapter — using pure JWT sessions (no DB writes on login)
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/connexion",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        // Placeholder — returns a mock user for now
        // TODO: connect to Prisma/Supabase once DB is stable
        if (credentials.email && credentials.password.length >= 8) {
          return {
            id: "1",
            email: credentials.email,
            name: credentials.email.split("@")[0],
            role: "PELERIN",
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "PELERIN"
      }
      if (account?.provider === "google" && profile) {
        token.role = "PELERIN"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
