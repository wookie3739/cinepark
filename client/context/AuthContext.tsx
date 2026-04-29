"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../lib/api/auth";
import type { AuthResponse } from "../types/auth";

const STORAGE_ACCESS = "cinepark_access_token";
const STORAGE_REFRESH = "cinepark_refresh_token";
const STORAGE_USER = "cinepark_user";

type UserSummary = Pick<AuthResponse, "email" | "name" | "role">;

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
};

type AuthContextValue = {
  user: UserSummary | null;
  accessToken: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStorage(): { access: string | null; user: UserSummary | null } {
  if (typeof window === "undefined") {
    return { access: null, user: null };
  }
  try {
    const access = sessionStorage.getItem(STORAGE_ACCESS);
    const raw = sessionStorage.getItem(STORAGE_USER);
    const user = raw ? (JSON.parse(raw) as UserSummary) : null;
    return { access, user };
  } catch {
    return { access: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const { access, user: u } = readStorage();
    setAccessToken(access);
    setUser(u);
    setIsReady(true);
  }, []);

  const persist = useCallback((res: AuthResponse) => {
    sessionStorage.setItem(STORAGE_ACCESS, res.accessToken);
    sessionStorage.setItem(STORAGE_REFRESH, res.refreshToken);
    const summary: UserSummary = { email: res.email, name: res.name, role: res.role };
    sessionStorage.setItem(STORAGE_USER, JSON.stringify(summary));
    setAccessToken(res.accessToken);
    setUser(summary);
  }, []);

  const clear = useCallback(() => {
    sessionStorage.removeItem(STORAGE_ACCESS);
    sessionStorage.removeItem(STORAGE_REFRESH);
    sessionStorage.removeItem(STORAGE_USER);
    setAccessToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      if (!res.success || !res.data) {
        throw new Error(res.message || "로그인에 실패했습니다.");
      }
      persist(res.data);
    },
    [persist],
  );

  const registerFn = useCallback(
    async (payload: RegisterPayload) => {
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
      persist(res.data);
    },
    [persist],
  );

  const logout = useCallback(() => {
    void authApi.logoutRemote();
    clear();
  }, [clear]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isReady,
      login,
      register: registerFn,
      logout,
    }),
    [user, accessToken, isReady, login, registerFn, logout],
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
