import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      bannerImage?: string | null;
      verified?: boolean;
    };
  }

  interface User extends DefaultUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    bannerImage?: string | null;
    verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    verified?: boolean;
  }
} 