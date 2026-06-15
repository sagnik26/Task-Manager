import { useQuery } from "@tanstack/react-query";

import { listUsers } from "@/modules/users/api/users.api";
import { userKeys } from "@/modules/users/api/query-keys";

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: listUsers,
  });
}
