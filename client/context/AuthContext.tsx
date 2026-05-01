"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import * as authApi from "../lib/api/auth";
import { AUTH_SESSION_ACCESS_KEY } from "../lib/auth-browser-session";
import type { MyProfile } from "../types/auth";

const STORAGE_REFRESH = "cinepark_refresh_token";
const STORAGE_USER = "cinepark_user";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
};

type UserSummary = {
  email: string;
  name: string;
  role: string;
  phoneNumber?: string;
};

type AuthContextValue = {
  user: UserSummary | null;
  accessToken: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  /** 프로필 저장 후 세션·헤더 이름 동기화 */
  syncUserFromProfile: (p: MyProfile) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const isReady = status !== "loading";
  const accessToken = session?.accessToken ?? null;

  const user = useMemo((): UserSummary | null => {
    const u = session?.user;
    if (!u?.email) return null;
    return {
      email: u.email,
      name: u.name ?? "",
      role: u.role ?? "USER",
      phoneNumber: u.phoneNumber,
    };
  }, [session?.user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (accessToken) {
      sessionStorage.setItem(AUTH_SESSION_ACCESS_KEY, accessToken);
      const rt = session?.refreshToken;
      if (rt) sessionStorage.setItem(STORAGE_REFRESH, rt);
      if (user) sessionStorage.setItem(STORAGE_USER, JSON.stringify(user));
    } else if (status === "unauthenticated") {
      sessionStorage.removeItem(AUTH_SESSION_ACCESS_KEY);
      sessionStorage.removeItem(STORAGE_REFRESH);
      sessionStorage.removeItem(STORAGE_USER);
    }
  }, [accessToken, session?.refreshToken, user, status]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });
    if (typeof res === "object" && res !== null && "ok" in res && !res.ok) {
      const msg =
        res.error === "CredentialsSignin"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : (res.error ?? "로그인에 실패했습니다.");
      throw new Error(msg);
    }
  }, []);

  const registerFn = useCallback(async (payload: RegisterPayload) => {
    const res = await authApi.register({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phoneNumber: payload.phoneNumber,
      agreeTerms: payload.agreeTerms,
      agreePrivacy: payload.agreePrivacy,
      agreeMarketing: payload.agreeMarketing,
    });
    if (!res.success || !res.data) {
      throw new Error(res.message || "회원가입에 실패했습니다.");
    }
    const sign = await signIn("credentials", {
      email: payload.email.trim(),
      password: payload.password,
      redirect: false,
    });
    if (typeof sign === "object" && sign !== null && "ok" in sign && !sign.ok) {
      throw new Error("가입은 완료되었으나 자동 로그인에 실패했습니다. 로그인해 주세요.");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logoutRemote();
    } catch {
      /* noop */
    }
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(AUTH_SESSION_ACCESS_KEY);
      sessionStorage.removeItem(STORAGE_REFRESH);
      sessionStorage.removeItem(STORAGE_USER);
    }
    await signOut({ redirect: false });
  }, []);

  const syncUserFromProfile = useCallback(
    async (p: MyProfile) => {
      await update({
        name: p.name,
        phoneNumber: p.phoneNumber,
        role: p.role,
      });
    },
    [update],
  );

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isReady,
      login,
      register: registerFn,
      logout,
      syncUserFromProfile,
    }),
    [user, accessToken, isReady, login, registerFn, logout, syncUserFromProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}
