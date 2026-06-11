import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import { useAuthStore } from "../../../store";
import type { LoginInput, RegisterInput } from "../schemas/auth.schemas";
import { AuthContext, type AuthContextValue } from "./auth.context";
import * as authApi from "../../../api/auth.api";
import { toApiError } from "../../../shared/utils/apiErrors";

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const bootstrapRunningRef = useRef(false);

  const bootstrap = useCallback(async () => {
    if (bootstrapRunningRef.current) return;
    bootstrapRunningRef.current = true;
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch (err) {
      const apiError = toApiError(err);
      // If the cookie is missing/expired, treat as logged out.
      if (apiError.kind === "unauthorized") {
        clear();
      }
    } finally {
      setIsBootstrapped(true);
      bootstrapRunningRef.current = false;
    }
  }, [clear, setUser]);

  const login = useCallback(
    async (input: LoginInput) => {
      const { email, password } = input;
      if (typeof email !== "string" || typeof password !== "string") {
        throw new Error("Invalid login input");
      }
      const nextUser = await authApi.login({ email, password });
      setUser(nextUser);
    },
    [setUser],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const { name, email, password } = input;
      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        throw new Error("Invalid registration input");
      }
      const nextUser = await authApi.register({ name, email, password });
      setUser(nextUser);
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clear();
    }
  }, [clear]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapped,
      bootstrap,
      login,
      register,
      logout,
    }),
    [bootstrap, isBootstrapped, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

