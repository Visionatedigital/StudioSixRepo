import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';

// Define custom types to extend the default NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    bannerImage: string | null;
    verified: boolean;
    subscriptionStatus: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    bannerImage: string | null;
    verified: boolean;
    subscriptionStatus: string;
  }
}

// Type for user with password
type UserWithPassword = User & {
  password: string | null;
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            bannerImage: true,
            verified: true,
            subscriptionStatus: true,
            password: true,
          }
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Return user without password
        return {
          id: user.id,
          email: user.email || '',
          name: user.name,
          image: user.image,
          bannerImage: user.bannerImage,
          verified: user.verified,
          subscriptionStatus: user.subscriptionStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // When signing in
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.bannerImage = user.bannerImage;
        token.verified = user.verified;
        token.subscriptionStatus = user.subscriptionStatus;
      } else {
        // On subsequent requests, fetch fresh user data
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            subscriptionStatus: true,
          },
        });
        if (freshUser) {
          token.subscriptionStatus = freshUser.subscriptionStatus;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.bannerImage = token.bannerImage;
        session.user.verified = token.verified;
        session.user.subscriptionStatus = token.subscriptionStatus;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 