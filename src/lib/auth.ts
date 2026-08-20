import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { headers } from 'next/headers'
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs"
import { analyticsDevice, recordAnalyticsEvent } from '@/lib/analytics'
import { checkRateLimitKey, pelerinAuthRatelimit } from '@/lib/ratelimit'

function loginBrowser(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return 'Edge'
  if (/Firefox\//i.test(userAgent)) return 'Firefox'
  if (/CriOS|Chrome\//i.test(userAgent)) return 'Chrome'
  if (/Safari\//i.test(userAgent)) return 'Safari'
  return userAgent ? 'Autre' : 'Inconnu'
}

function decodedLoginCity(value: string | null) {
  if (!value) return null
  try { return decodeURIComponent(value) } catch { return value }
}

async function recordAuthenticatedLogin(input: {
  userId?: string | null
  email: string
  role: 'GUIDE' | 'PELERIN'
  path: '/guide/connexion' | '/connexion'
  method: 'email' | 'google'
  guideAccountId?: string
}) {
  try {
    const values = await headers()
    const userAgent = values.get('user-agent') || ''
    await recordAnalyticsEvent({
      eventName: 'login_success',
      userId: input.userId,
      path: input.path,
      country: values.get('x-vercel-ip-country'),
      device: analyticsDevice(userAgent),
      metadata: {
        email: input.email.toLowerCase(),
        role: input.role,
        method: input.method,
        ip: values.get('x-forwarded-for')?.split(',')[0]?.trim() || values.get('x-real-ip') || 'unknown',
        city: decodedLoginCity(values.get('x-vercel-ip-city')),
        browser: loginBrowser(userAgent),
        userAgent: userAgent.slice(0, 240),
        ...(input.guideAccountId && { guideAccountId: input.guideAccountId }),
      },
    })
  } catch (error) {
    console.error('[auth] login analytics failed', error)
  }
}

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
      id: "pelerin-credentials",
      name: "Pelerin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const email = credentials.email.trim().toLowerCase()
          const values = await headers()
          const ip = values.get('x-forwarded-for')?.split(',')[0]?.trim()
            || values.get('x-real-ip')
            || 'unknown'
          const limited = await checkRateLimitKey(pelerinAuthRatelimit, `${ip}:${email}`)
          if (limited) return null

          const user = await prisma.user.findUnique({
            where: { email },
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
          await recordAuthenticatedLogin({
            userId: user.id,
            email: user.email || email,
            role: 'PELERIN',
            path: '/connexion',
            method: 'email',
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
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        let accountCreated = false
        try {
          const normalizedEmail = user.email.trim().toLowerCase()
          user.email = normalizedEmail
          const [existing, guideAccount] = await Promise.all([
            prisma.user.findUnique({ where: { email: normalizedEmail } }),
            prisma.guideAccount.findUnique({ where: { email: normalizedEmail }, select: { id: true } }),
          ])
          if (guideAccount) {
            console.error('[auth] Google signIn refusé pour une adresse Guide')
            return false
          }
          if (!existing) {
            const created = await prisma.user.create({
              data: {
                email: normalizedEmail,
                name: user.name ?? null,
                image: user.image ?? null,
                role: "PELERIN",
                emailVerified: new Date(),
              },
            });
            user.id = created.id;
            ;(user as any).role = 'PELERIN'
            accountCreated = true
          } else {
            // Une identité guide/admin ne peut jamais ouvrir une session pèlerin
            // via Google avec la même adresse email.
            if (existing.role !== 'PELERIN') {
              console.error('[auth] Google signIn refusé pour un compte non-pèlerin')
              return false
            }
            user.id = existing.id;
            ;(user as any).role = existing.role
            // Set emailVerified if missing (first Google login after email/password account)
            if (!existing.emailVerified) {
              await prisma.user.update({
                where: { id: existing.id },
                data: { emailVerified: new Date() },
              });
            }
          }
          if (accountCreated) {
            await recordAnalyticsEvent({ eventName: 'account_created', userId: user.id, path: '/inscription', metadata: { method: 'google', role: 'PELERIN' } })
          }
          await recordAuthenticatedLogin({
            userId: user.id,
            email: user.email,
            role: 'PELERIN',
            path: '/connexion',
            method: 'google',
          })
        } catch (e) {
          console.error('[auth] Google signIn upsert error', e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "PELERIN"
        token.firstName = (user as any).firstName || null
        token.emailVerified = (user as any).emailVerified ?? null
      }
      if (account?.provider === "google") {
        // Google verifies emails — always mark as verified
        token.emailVerified = new Date()
        // Resolve DB id from email (Google's OAuth id ≠ our DB id)
        if (user?.email) {
          const dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true, firstName: true, role: true } });
          if (dbUser) {
            token.id = dbUser.id;
            token.firstName = dbUser.firstName ?? null;
            token.role = dbUser.role;
          }
        }
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
    // Explicite plutôt qu'implicite : honore tout callbackUrl relatif ou de
    // même origine (ex. reprendre le tunnel de réservation après OAuth),
    // sans dépendre du comportement par défaut de NextAuth.
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      try {
        if (new URL(url).origin === baseUrl) return url
      } catch { /* url invalide — retombe sur baseUrl */ }
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
