import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: DefaultSession["user"] & {
      role: string;
      phoneNumber?: string;
    };
  }

  interface User {
    role: string;
    phoneNumber?: string;
    accessToken: string;
    refreshToken: string;
  }
}
