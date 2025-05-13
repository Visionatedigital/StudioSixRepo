import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { JWT } from 'next-auth/jwt';
import { Prisma, User } from '@prisma/client';

type DatabaseUser = User;

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  bannerImage: string | null;
  credits: number;
  level: number;
  verified: boolean;
  subscriptionStatus: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing email or password");
          return null;
        }

        try {
          console.log("[AUTH] Attempting to find user with email:", credentials.email);
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              bannerImage: true,
              credits: true,
              level: true,
              verified: true,
              subscriptionStatus: true,
              hashedPassword: true
            }
          });

          if (!user?.hashedPassword || !user.email) {
            console.log("[AUTH] User not found or missing hashedPassword");
            return null;
          }

          console.log("[AUTH] User found, comparing passwords");
          const passwordsMatch = await bcrypt.compare(credentials.password, user.hashedPassword);

          if (!passwordsMatch) {
            console.log("[AUTH] Password does not match");
            return null;
          }

          console.log("[AUTH] Authentication successful for user:", { id: user.id, email: user.email });
          
          const { hashedPassword, ...userWithoutPassword } = user;
          return userWithoutPassword as any;
        } catch (error) {
          console.error("[AUTH] Detailed error during authorization:", {
            error: error instanceof Error ? {
              message: error.message,
              stack: error.stack,
              name: error.name
            } : error,
            credentials: {
              email: credentials?.email,
              hasPassword: !!credentials?.password
            }
          });
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/sign-in",
    error: "/error",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // Handle session update
        return { ...token, ...session.user };
      }

      if (user) {
        // Initial sign in
        const dbUser = user as DatabaseUser;
        return {
          ...token,
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.image,
          bannerImage: dbUser.bannerImage,
          credits: dbUser.credits,
          level: dbUser.level,
          verified: dbUser.verified,
          email_verified: dbUser.emailVerified,
          subscriptionStatus: dbUser.subscriptionStatus
        };
      }

      // Check if we need to update email verification status
      if (token.email) {
        const user = await prisma.user.findUnique({
          where: { email: token.email },
          select: { emailVerified: true }
        });
        if (user?.emailVerified) {
          token.email_verified = user.emailVerified;
        }
      }

      // On subsequent requests, token already has the user info
      return token;
    },
    async session({ session, token }) {
      if (!token.email) return session;

      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email,
          name: token.name,
          image: token.image,
          bannerImage: token.bannerImage as string | null,
          credits: token.credits as number,
          level: token.level as number,
          verified: token.verified as boolean,
          subscriptionStatus: token.subscriptionStatus as AuthUser['subscriptionStatus']
        },
      };
    },
    async redirect({ url, baseUrl }) {
      // If the url is relative, prepend the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If the url is already absolute but on the same host, allow it
      else if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default to the base URL
      return baseUrl;
    }
  },
}

export async function updateSession(token: JWT): Promise<JWT> {
  if (!token.email) return token;

  const dbUser = await prisma.user.findFirst({
    where: {
      email: token.email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      bannerImage: true,
      credits: true,
      level: true,
      verified: true,
      subscriptionStatus: true
    }
  });

  if (!dbUser) {
    return token;
  }

  return {
    ...token,
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    bannerImage: dbUser.bannerImage,
    credits: dbUser.credits,
    level: dbUser.level,
    verified: dbUser.verified,
    subscriptionStatus: dbUser.subscriptionStatus
  };
} 