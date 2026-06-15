import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PermissionFlags, User } from "@/modules/auth/types/auth.types";

type AuthState = {
  user: User | null;
  permissions: PermissionFlags | null;
  setUser: (user: User | null) => void;
  setPermissions: (permissions: PermissionFlags | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      permissions: null,
      setUser: (user) => set({ user }),
      setPermissions: (permissions) => set({ permissions }),
      clear: () => set({ user: null, permissions: null }),
    }),
    { name: "taskflow.auth", skipHydration: true },
  ),
);
