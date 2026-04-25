import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
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
      id: "guide-credentials",
      name: "Guide Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })
          if (!user || user.role !== "GUIDE") return null
          if (!user.emailVerified) return null
          if (!user.passwordHash) return null
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValid) return null
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          })
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            role: "GUIDE",
            emailVerified: user.emailVerified,
          }
        } catch {
          return null
        }
      },
    }),
    CredentialsProvider({
      id: "pelerin-credentials",
      name: "Pelerin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })
          if (!user || user.role !== "PELERIN") return null
          if (!user.emailVerified) return null
          if (!user.passwordHash) return null
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValid) return null
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          })
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            role: "PELERIN",
            emailVerified: user.emailVerified,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "PELERIN"
        token.firstName = (user as any).firstName || null
        token.emailVerified = (user as any).emailVerified ?? null
      }
      if (account?.provider === "google") {
        token.role = "PELERIN"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).firstName = token.firstName as string | null;
        (session.user as any).emailVerified = token.emailVerified ?? null;
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
