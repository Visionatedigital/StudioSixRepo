import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED';

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email: string;
      image?: string | null;
      bannerImage?: string | null;
      credits: number;
      level: number;
      verified: boolean;
      subscriptionStatus: SubscriptionStatus;
    };
  }

  interface User extends DefaultUser {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    bannerImage?: string | null;
    credits: number;
    level: number;
    verified: boolean;
    subscriptionStatus: SubscriptionStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    bannerImage?: string | null;
    credits: number;
    level: number;
    verified: boolean;
    subscriptionStatus: SubscriptionStatus;
  }
} 