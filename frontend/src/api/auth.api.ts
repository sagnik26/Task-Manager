import { apiClient } from "../shared/http/client";
import { extractResponseData } from "../shared/utils/apiResponse";
import type { User } from "../types";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

type AuthResult = { token: string; user: User };

export async function register(payload: RegisterPayload): Promise<User> {
  const res = await apiClient.post("/auth/register", payload);
  const data = extractResponseData<AuthResult>(res.data);
  return data.user;
}

export async function login(payload: LoginPayload): Promise<User> {
  const res = await apiClient.post("/auth/login", payload);
  const data = extractResponseData<AuthResult>(res.data);
  return data.user;
}

export async function getProfile(): Promise<User> {
  const res = await apiClient.get("/auth/profile");
  return extractResponseData<User>(res.data);
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

