"use client";

import { ProjectDetailScreen } from "@/modules/projects";
import { use } from "react";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ProjectDetailScreen projectId={id} />;
}
