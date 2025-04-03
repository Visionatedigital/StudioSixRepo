import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { JWT } from 'next-auth/jwt';

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt"
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      return {
        ...token,
        id: dbUser.id,
        name: dbUser.name || null,
        email: dbUser.email || null,
        picture: dbUser.image || null,
        bannerImage: dbUser.bannerImage || null,
        verified: dbUser.verified,
        subscriptionStatus: dbUser.subscriptionStatus,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture || null;
        session.user.bannerImage = token.bannerImage || null;
        session.user.verified = token.verified;
        session.user.subscriptionStatus = token.subscriptionStatus;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in"
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function updateSession(token: JWT): Promise<JWT> {
  const dbUser = await prisma.user.findFirst({
    where: {
      email: token.email,
    },
  });

  if (!dbUser) {
    return token;
  }

  return {
    ...token,
    id: dbUser.id,
    name: dbUser.name || null,
    email: dbUser.email || null,
    picture: dbUser.image || null,
    bannerImage: dbUser.bannerImage || null,
    verified: dbUser.verified,
    subscriptionStatus: dbUser.subscriptionStatus,
  };
} 