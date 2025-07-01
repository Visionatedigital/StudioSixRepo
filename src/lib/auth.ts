import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
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
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED';
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
          // console.log("[AUTH] Missing email or password");
          return null;
        }

        try {
          // console.log("[AUTH] Attempting to find user with email:", credentials.email);
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
              emailVerified: true,
              subscriptionStatus: true,
              hashedPassword: true,
              hasCompletedOnboarding: true,
            }
          });

          if (!user?.hashedPassword || !user.email) {
            // console.log("[AUTH] User not found or missing hashedPassword");
            return null;
          }

          // console.log("[AUTH] User found, comparing passwords");
          const passwordsMatch = await bcrypt.compare(credentials.password, user.hashedPassword);

          if (!passwordsMatch) {
            // console.log("[AUTH] Password does not match");
            return null;
          }

          // console.log("[AUTH] Authentication successful for user:", { 
          //   id: user.id, 
          //   email: user.email,
          //   verified: user.verified,
          //   emailVerified: user.emailVerified
          // });
          
          const { hashedPassword, ...userWithoutPassword } = user;
          return userWithoutPassword as any;
        } catch (error) {
          // console.error("[AUTH] Detailed error during authorization:", {
          //   error: error instanceof Error ? {
          //     message: error.message,
          //     stack: error.stack,
          //     name: error.name
          //   } : error,
          //   credentials: {
          //     email: credentials?.email,
          //     hasPassword: !!credentials?.password
          //   }
          // });
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[AUTH] SignIn callback triggered:', {
        provider: account?.provider,
        userEmail: user?.email,
        userName: user?.name
      });
      
      // If this is a Google OAuth sign in
      if (account?.provider === 'google') {
        console.log('[AUTH] Google OAuth sign in detected');
        
        // Check if user exists in database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          console.log('[AUTH] Creating new user for Google OAuth');
          // Create new user with default values
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(), // Google users are automatically verified
              verified: true, // Google users are automatically verified
              credits: 10, // Default credits
              level: 1, // Default level
              subscriptionStatus: 'INACTIVE', // Default subscription
              hasCompletedOnboarding: false, // They'll need to complete onboarding
            },
          });
        } else {
          console.log('[AUTH] Existing user found for Google OAuth');
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // console.log("[AUTH] Session update triggered:", session);
        return { ...token, ...session.user };
      }

      if (user) {
        // Initial sign in
        const dbUser = user as DatabaseUser;
        // console.log("[AUTH] Initial sign in - User data:", {
        //   id: dbUser.id,
        //   email: dbUser.email,
        //   verified: dbUser.verified,
        //   emailVerified: dbUser.emailVerified
        // });
        
        // Add lastChecked timestamp for tracking when we last verified data
        const tokenData = {
          ...token,
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.image,
          bannerImage: dbUser.bannerImage,
          credits: dbUser.credits,
          level: dbUser.level,
          verified: Boolean(dbUser.verified),
          email_verified: dbUser.emailVerified,
          subscriptionStatus: dbUser.subscriptionStatus,
          hasCompletedOnboarding: dbUser.hasCompletedOnboarding,
          lastChecked: Date.now()
        };

        // console.log("[AUTH] Generated token data:", {
        //   verified: tokenData.verified,
        //   email_verified: tokenData.email_verified
        // });

        return tokenData;
      }

      // Only check for updates every 5 minutes to reduce DB queries
      const lastChecked = token.lastChecked as number || 0;
      const fiveMinutes = 5 * 60 * 1000;
      const shouldRefresh = Date.now() - lastChecked > fiveMinutes;
      
      // Check if we need to update email verification status
      if (token.email && shouldRefresh) {
        // console.log("[AUTH] Refreshing user data from database (5-minute interval)");
        try {
          const user = await prisma.user.findUnique({
            where: { email: token.email },
            select: { 
              emailVerified: true,
              credits: true,
              level: true,
              verified: true,
              subscriptionStatus: true,
              hasCompletedOnboarding: true,
            }
          });
          
          if (user) {
            // console.log("[AUTH] User data from refresh:", {
            //   verified: user.verified,
            //   emailVerified: user.emailVerified
            // });

            // Update verification status
            token.email_verified = user.emailVerified;
            token.verified = Boolean(user.verified);
            token.credits = user.credits;
            token.level = user.level;
            token.subscriptionStatus = user.subscriptionStatus;
            token.hasCompletedOnboarding = user.hasCompletedOnboarding;
            token.lastChecked = Date.now();

            // console.log("[AUTH] Updated token data:", {
            //   verified: token.verified,
            //   email_verified: token.email_verified
            // });
          }
        } catch (error) {
          // console.error("[AUTH] Error refreshing user data:", error);
          // Don't update lastChecked on error to try again next time
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.email) return session;

      const sessionData = {
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
          verified: Boolean(token.verified),
          email_verified: token.email_verified as Date | null,
          subscriptionStatus: token.subscriptionStatus as AuthUser['subscriptionStatus'],
          hasCompletedOnboarding: token.hasCompletedOnboarding,
        },
      };

      // console.log("[AUTH] Session data:", {
      //   verified: sessionData.user.verified,
      //   email_verified: sessionData.user.email_verified
      // });

      return sessionData;
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
      emailVerified: true,
      subscriptionStatus: true,
      hasCompletedOnboarding: true,
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
    verified: dbUser.verified || !!dbUser.emailVerified,
    email_verified: dbUser.emailVerified,
    subscriptionStatus: dbUser.subscriptionStatus,
    hasCompletedOnboarding: dbUser.hasCompletedOnboarding,
  };
} 