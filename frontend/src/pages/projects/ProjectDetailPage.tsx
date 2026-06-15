import { useParams } from "react-router-dom";

import { ProjectDetailScreen } from "@/modules/projects";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <ProjectDetailScreen projectId={id} />;
}
