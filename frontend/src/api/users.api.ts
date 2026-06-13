import { apiClient } from "../shared/http/client";
import { extractResponseData } from "../shared/utils/apiResponse";
import type { TenantUser } from "../types/users";

export async function listUsers(): Promise<TenantUser[]> {
  const res = await apiClient.get("/users");
  return extractResponseData<TenantUser[]>(res.data);
}
