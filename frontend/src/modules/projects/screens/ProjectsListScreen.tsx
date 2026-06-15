import {
  Check,
  Circle,
  Clock,
  LayoutList,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteProject, getProjectStats, listProjects } from "@/modules/projects/api/projects.api";
import { projectKeys } from "@/modules/projects/api/query-keys";
import { useAuth } from "@/modules/auth";
import { Can } from "@/shared/permissions/Can";
import { useCan } from "@/shared/permissions/usePermission";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Avatar } from "@/shared/ui/Avatar";
import {
  formatRelativeTime,
  projectVisuals,
} from "@/shared/theme/design";
import type { Project } from "@/modules/projects/types/projects.types";
import type { AppShellContext } from "@/shared/layouts/AppShell";
import { toApiError } from "@/shared/utils/apiErrors";

type ProjectWithStats = Project & {
  color: string;
  emoji: string;
  taskCount: number;
  doneCount: number;
  progress: number;
  updated: string;
};

export function ProjectsListScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openNewProject } = useOutletContext<AppShellContext>();
  const { user } = useAuth();
  const canCreateProject = useCan("createProject");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: async () => {
      setDeleteError(null);
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      setDeleteError(toApiError(error).message);
    },
  });

  function handleDeleteProject(project: Project, event: MouseEvent) {
    event.stopPropagation();
    const ok = window.confirm(
      `Delete "${project.name}"? All tasks in this project will be permanently removed.`,
    );
    if (!ok) return;
    deleteProjectMutation.mutate(project.id);
  }

  const projectsQuery = useQuery({
    queryKey: projectKeys.all,
    queryFn: listProjects,
  });

  const projects = projectsQuery.data ?? [];

  const statsQueries = useQueries({
    queries: projects.map((p) => ({
      queryKey: projectKeys.stats(p.id),
      queryFn: () => getProjectStats(p.id),
      enabled: Boolean(p.id),
    })),
  });

  const enriched = useMemo((): ProjectWithStats[] => {
    return projects.map((project, index) => {
      const stats = statsQueries[index]?.data as
        | { byStatus?: Record<string, number> }
        | undefined;
      const byStatus = stats?.byStatus ?? { todo: 0, in_progress: 0, done: 0 };
      const taskCount =
        (byStatus.todo ?? 0) + (byStatus.in_progress ?? 0) + (byStatus.done ?? 0);
      const doneCount = byStatus.done ?? 0;
      const { color, emoji } = projectVisuals(index);
      const progress =
        taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

      return {
        ...project,
        color,
        emoji,
        taskCount,
        doneCount,
        progress,
        updated: formatRelativeTime(new Date()),
      };
    });
  }, [projects, statsQueries]);

  const totals = useMemo(() => {
    const total = enriched.reduce((sum, p) => sum + p.taskCount, 0);
    const done = enriched.reduce((sum, p) => sum + p.doneCount, 0);
    const inProgress = enriched.reduce((sum, p) => {
      const stats = statsQueries[projects.indexOf(p)]?.data as
        | { byStatus?: Record<string, number> }
        | undefined;
      return sum + (stats?.byStatus?.in_progress ?? 0);
    }, 0);
    const todo = enriched.reduce((sum, p) => {
      const stats = statsQueries[projects.indexOf(p)]?.data as
        | { byStatus?: Record<string, number> }
        | undefined;
      return sum + (stats?.byStatus?.todo ?? 0);
    }, 0);
    return { total, done, inProgress, todo };
  }, [enriched, projects, statsQueries]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  if (projectsQuery.isLoading) {
    return (
      <div className="page-scroll">
        <LoadingState label="Loading dashboard…" />
      </div>
    );
  }

  if (projectsQuery.isError) {
    const err = toApiError(projectsQuery.error);
    return (
      <div className="page-scroll">
        <ErrorState
          message={err.message}
          actionLabel="Retry"
          onAction={() => void projectsQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="page-scroll">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">Good morning, {firstName}</h1>
          <p className="dashboard-subtitle">
            <span className="text-blue">{totals.inProgress}</span> tasks in progress ·{" "}
            <span style={{ color: "var(--secondary)", fontWeight: 600 }}>{totals.todo}</span> to do
          </p>
        </div>
        <Can permission="createProject">
          <button
            type="button"
            className="btn btn-primary btn-primary--md"
            onClick={openNewProject}
          >
            <Plus size={13} strokeWidth={2.5} />
            New project
          </button>
        </Can>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__row">
            <span className="stat-card__label">Total tasks</span>
            <div className="stat-card__icon" style={{ background: "#E6EFFC" }}>
              <LayoutList size={14} color="#0073EA" strokeWidth={2.2} />
            </div>
          </div>
          <span className="stat-card__value">{totals.total}</span>
          <span className="stat-card__caption" style={{ color: "var(--secondary)" }}>
            Across all projects
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card__row">
            <span className="stat-card__label">Completed</span>
            <div
              className="stat-card__icon"
              style={{ background: "rgba(0,200,117,0.12)" }}
            >
              <Check size={14} color="#00854D" strokeWidth={2.5} />
            </div>
          </div>
          <span className="stat-card__value">{totals.done}</span>
          <span className="stat-card__caption" style={{ color: "#00854D" }}>
            Done tasks
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card__row">
            <span className="stat-card__label">In progress</span>
            <div
              className="stat-card__icon"
              style={{ background: "rgba(253,171,61,0.12)" }}
            >
              <Clock size={14} color="#C47B00" strokeWidth={2.2} />
            </div>
          </div>
          <span className="stat-card__value">{totals.inProgress}</span>
          <span className="stat-card__caption" style={{ color: "#C47B00" }}>
            Active work
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card__row">
            <span className="stat-card__label">To do</span>
            <div
              className="stat-card__icon"
              style={{ background: "rgba(196,196,196,0.2)" }}
            >
              <Circle size={14} color="#676879" strokeWidth={2.2} />
            </div>
          </div>
          <span className="stat-card__value">{totals.todo}</span>
          <span className="stat-card__caption" style={{ color: "var(--secondary)" }}>
            Not started yet
          </span>
        </div>
      </div>

      <h2 className="section-title" style={{ marginBottom: 13 }}>
        All projects
      </h2>

      {deleteError ? (
        <div className="alert-error" style={{ marginBottom: 12 }}>
          {deleteError}
        </div>
      ) : null}

      {enriched.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={
            canCreateProject
              ? "Create your first project to start tracking tasks."
              : "You have not been added to any projects yet."
          }
          actionLabel={canCreateProject ? "Create project" : undefined}
          onAction={canCreateProject ? openNewProject : undefined}
        />
      ) : (
        <div className="project-grid">
          {enriched.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/projects/${project.id}`);
              }}
              role="button"
              tabIndex={0}
            >
              <div
                className="project-card__stripe"
                style={{ background: project.color }}
              />
              <div className="project-card__body">
                <div className="project-card__top">
                  <div className="project-card__info">
                    <div
                      className="project-card__emoji"
                      style={{ background: `${project.color}22` }}
                    >
                      {project.emoji}
                    </div>
                    <div>
                      <div className="project-card__name">{project.name}</div>
                      <div className="project-card__count">
                        {project.taskCount} tasks
                      </div>
                    </div>
                  </div>
                  <Can permission="deleteProject">
                    <button
                      type="button"
                      className="icon-btn icon-btn--sm icon-btn--danger"
                      onClick={(e) => handleDeleteProject(project, e)}
                      disabled={deleteProjectMutation.isPending}
                      aria-label={`Delete ${project.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </Can>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-value">{project.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill"
                      style={{
                        width: `${project.progress}%`,
                        background: project.color,
                      }}
                    />
                  </div>
                </div>

                <div className="project-card__footer">
                  <div className="avatar-stack">
                    {user ? (
                      <Avatar name={user.name} seed={user.id} size={22} />
                    ) : null}
                  </div>
                  <span className="project-card__updated">{project.updated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
