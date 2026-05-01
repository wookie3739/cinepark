import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as authApi from "./lib/api/auth";

const devSecret =
  process.env.NODE_ENV !== "production"
    ? "dev-only-cinepark-auth-secret-min-32-chars-x"
    : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? devSecret,
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const res = await authApi.login({ email, password });
        if (!res.success || !res.data) return null;

        const d = res.data;
        return {
          id: d.email,
          email: d.email,
          name: d.name,
          role: d.role,
          phoneNumber: d.phoneNumber,
          accessToken: d.accessToken,
          refreshToken: d.refreshToken,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as {
          accessToken: string;
          refreshToken: string;
          role: string;
          phoneNumber?: string;
          email?: string | null;
          name?: string | null;
        };
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.role = u.role;
        token.phoneNumber = u.phoneNumber;
        token.email = u.email;
        token.name = u.name;
      }
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as Record<string, unknown>;
        if (typeof s.name === "string") token.name = s.name;
        if (typeof s.phoneNumber === "string") token.phoneNumber = s.phoneNumber;
        if (typeof s.role === "string") token.role = s.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string | undefined) ?? session.user.email;
        session.user.name = (token.name as string | undefined) ?? session.user.name;
        session.user.role = token.role as string;
        session.user.phoneNumber = token.phoneNumber as string | undefined;
      }
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string | undefined;
      return session;
    },
  },
});
