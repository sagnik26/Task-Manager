import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import * as authApi from "@/modules/auth/api/auth.api";
import { useAuthStore } from "@/modules/auth/context/auth.store";
import type { LoginInput, RegisterInput } from "@/modules/auth/schemas/auth.schemas";
import { toApiError } from "@/shared/utils/apiErrors";
import { AuthContext, type AuthContextValue } from "./auth.context";

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const setUser = useAuthStore((s) => s.setUser);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const clear = useAuthStore((s) => s.clear);

  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const bootstrapRunningRef = useRef(false);

  const loadPermissions = useCallback(async () => {
    const nextPermissions = await authApi.getPermissions();
    setPermissions(nextPermissions);
  }, [setPermissions]);

  const bootstrap = useCallback(async () => {
    if (bootstrapRunningRef.current) return;
    bootstrapRunningRef.current = true;
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      await loadPermissions();
    } catch (err) {
      const apiError = toApiError(err);
      if (apiError.kind === "unauthorized") {
        clear();
      }
    } finally {
      setIsBootstrapped(true);
      bootstrapRunningRef.current = false;
    }
  }, [clear, loadPermissions, setUser]);

  const login = useCallback(
    async (input: LoginInput) => {
      const { email, password } = input;
      if (typeof email !== "string" || typeof password !== "string") {
        throw new Error("Invalid login input");
      }
      const nextUser = await authApi.login({ email, password });
      setUser(nextUser);
      await loadPermissions();
    },
    [loadPermissions, setUser],
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
      await loadPermissions();
    },
    [loadPermissions, setUser],
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
      permissions,
      isAuthenticated: Boolean(user),
      isBootstrapped,
      bootstrap,
      login,
      register,
      logout,
    }),
    [bootstrap, isBootstrapped, login, logout, permissions, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
