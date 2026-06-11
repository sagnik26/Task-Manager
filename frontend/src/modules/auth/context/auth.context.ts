import { createContext } from "react";

import type { LoginInput, RegisterInput } from "../schemas/auth.schemas";
import type { AuthSession } from "../../../types/auth";

export type AuthContextValue = AuthSession & {
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  bootstrap: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

