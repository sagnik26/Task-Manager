import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateProjectModal } from "../../modules/projects/components/CreateProjectModal";
import type { CreateProjectValues } from "../../modules/projects/components/CreateProjectModal";
import { createProject } from "../../api/projects.api";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export type AppShellContext = {
  openNewProject: () => void;
};

export function AppShell() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  async function onCreate(values: CreateProjectValues) {
    await createMutation.mutateAsync({
      name: values.name,
      description: values.description ? values.description : null,
    });
  }

  return (
    <div className="app-shell">
      <Topbar />
      <div className="app-body">
        <Sidebar onNewProject={() => setModalOpen(true)} />
        <main className="main-content">
          <Outlet context={{ openNewProject: () => setModalOpen(true) } satisfies AppShellContext} />
        </main>
      </div>

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={onCreate}
      />
    </div>
  );
}
