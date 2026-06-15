"use client";

import { useCallback, useState, type ReactNode } from "react";

import {
  CreateProjectModal,
  buildOptimisticProjectPayload,
  useCreateProject,
  type CreateProjectValues,
} from "@/modules/projects";
import { useCan } from "@/shared/permissions/usePermission";
import { useToast } from "@/shared/ui/toast";
import { AppShellContext } from "./AppShellContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export type { AppShellContext as AppShellContextType } from "./AppShellContext";

export function AppShell({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();
  const createMutation = useCreateProject({
    onError: (message) => toast.error(message),
  });
  const canCreateProject = useCan("createProject");

  function onCreate(values: CreateProjectValues) {
    createMutation.mutate(
      buildOptimisticProjectPayload({
        name: values.name,
        description: values.description ? values.description : null,
      }),
    );
  }

  const openNewProject = useCallback(() => {
    if (!canCreateProject) return;
    setModalOpen(true);
  }, [canCreateProject]);

  return (
    <AppShellContext.Provider value={{ openNewProject }}>
      <div className="app-shell">
        <Topbar />
        <div className="app-body">
          <Sidebar onNewProject={openNewProject} />
          <main className="main-content">{children}</main>
        </div>

        {canCreateProject ? (
          <CreateProjectModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onCreate={onCreate}
          />
        ) : null}
      </div>
    </AppShellContext.Provider>
  );
}
