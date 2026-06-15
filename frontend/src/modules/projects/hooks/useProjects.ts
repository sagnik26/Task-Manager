import { useQuery } from "@tanstack/react-query";

import { listProjects } from "@/modules/projects/api/projects.api";
import { projectKeys } from "@/modules/projects/api/query-keys";

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: listProjects,
  });
}
