import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";

import {
  CreateProjectModal,
  useCreateProject,
  type CreateProjectValues,
} from "@/modules/projects";
import { useCan } from "@/shared/permissions/usePermission";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export type AppShellContext = {
  openNewProject: () => void;
};

export function AppShell() {
  const [modalOpen, setModalOpen] = useState(false);
  const createMutation = useCreateProject();
  const canCreateProject = useCan("createProject");

  async function onCreate(values: CreateProjectValues) {
    await createMutation.mutateAsync({
      name: values.name,
      description: values.description ? values.description : null,
    });
  }

  const openNewProject = useCallback(() => {
    if (!canCreateProject) return;
    setModalOpen(true);
  }, [canCreateProject]);

  return (
    <div className="app-shell">
      <Topbar />
      <div className="app-body">
        <Sidebar onNewProject={openNewProject} />
        <main className="main-content">
          <Outlet context={{ openNewProject } satisfies AppShellContext} />
        </main>
      </div>

      {canCreateProject ? (
        <CreateProjectModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={onCreate}
        />
      ) : null}
    </div>
  );
}
