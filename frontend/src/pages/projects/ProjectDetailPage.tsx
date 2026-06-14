import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Filter,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../modules/auth/context/useAuth.ts";
import { ProjectMembersPanel } from "../../modules/projects/components/ProjectMembersPanel";
import { getProject, deleteProject, listProjectMembers, listProjects } from "../../api/projects.api";
import { Can } from "../../shared/permissions/Can";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "../../api/tasks.api";
import { toApiError } from "../../shared/utils/apiErrors";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { KanbanBoard } from "../../modules/tasks/components/KanbanBoard";
import {
  DEFAULT_TASK_FILTERS,
  FilterPanel,
  type TaskFilterState,
} from "../../modules/tasks/components/FilterPanel";
import {
  DEFAULT_SORT,
  SortPanel,
  type SortState,
} from "../../modules/tasks/components/SortPanel";
import { TaskModal } from "../../modules/tasks/components/TaskModal";
import {
  applyTaskQuery,
  countActiveFilters,
  isQueryActive,
  isSortActive,
} from "../../modules/tasks/utils/applyTaskQuery";
import { PROJECT_SORT_OPTIONS, projectVisuals } from "../../shared/theme/design";
import type { Task, TaskStatus } from "../../types/tasks";

export function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id ?? "";
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id ?? "me";
  const userName = user?.name ?? "Me";

  const queryClient = useQueryClient();
  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => listTasks(projectId, {}),
    enabled: Boolean(projectId),
  });

  const membersQuery = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => listProjectMembers(projectId),
    enabled: Boolean(projectId),
  });

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [appliedFilterState, setAppliedFilterState] =
    useState<TaskFilterState>(DEFAULT_TASK_FILTERS);
  const [appliedSortState, setAppliedSortState] = useState<SortState>(DEFAULT_SORT);
  const [draftFilterState, setDraftFilterState] =
    useState<TaskFilterState>(DEFAULT_TASK_FILTERS);
  const [draftSortState, setDraftSortState] = useState<SortState>(DEFAULT_SORT);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<"create" | "edit">("create");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [tasksActionError, setTasksActionError] = useState<string | null>(null);
  const [deleteProjectError, setDeleteProjectError] = useState<string | null>(null);

  const tasks = useMemo(() => (tasksQuery.data ?? []) as Task[], [tasksQuery.data]);

  const filtered = useMemo(
    () =>
      applyTaskQuery(
        tasks,
        { ...appliedFilterState, ...appliedSortState },
        { currentUserId },
      ),
    [appliedFilterState, appliedSortState, currentUserId, tasks],
  );

  const activeFilterCount = countActiveFilters(appliedFilterState);
  const sortIsActive = isSortActive(appliedSortState);
  const queryIsActive = isQueryActive(appliedFilterState, appliedSortState);

  function clearFiltersAndSort() {
    setAppliedFilterState(DEFAULT_TASK_FILTERS);
    setAppliedSortState(DEFAULT_SORT);
    setDraftFilterState(DEFAULT_TASK_FILTERS);
    setDraftSortState(DEFAULT_SORT);
  }

  function openFilterPanel() {
    setSortOpen(false);
    setFilterOpen((open) => {
      if (open) {
        setDraftFilterState(appliedFilterState);
        return false;
      }
      setDraftFilterState(appliedFilterState);
      return true;
    });
  }

  function openSortPanel() {
    setFilterOpen(false);
    setSortOpen((open) => {
      if (open) {
        setDraftSortState(appliedSortState);
        return false;
      }
      setDraftSortState(appliedSortState);
      return true;
    });
  }

  function applyFilters() {
    setAppliedFilterState(draftFilterState);
    setFilterOpen(false);
  }

  function cancelFilters() {
    setDraftFilterState(appliedFilterState);
    setFilterOpen(false);
  }

  function applySort() {
    setAppliedSortState(draftSortState);
    setSortOpen(false);
  }

  function cancelSort() {
    setDraftSortState(appliedSortState);
    setSortOpen(false);
  }

  const projectIndex = (projectsQuery.data ?? []).findIndex((p) => p.id === projectId);
  const { color: projectColor } = projectVisuals(Math.max(0, projectIndex));

  const createTaskMutation = useMutation({
    mutationFn: (payload: Omit<Task, "id">) => {
      if (!projectId) throw new Error("projectId is required");
      return createTask(projectId, {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        assigneeId: payload.assigneeId,
        dueDate: payload.dueDate,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      patch,
    }: {
      taskId: string;
      patch: Partial<Omit<Task, "id">>;
    }) => updateTask(taskId, patch),
    onMutate: async ({ taskId, patch }) => {
      setTasksActionError(null);
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });
      const previous = queryClient.getQueryData(["tasks", projectId]) as
        | Task[]
        | undefined;
      if (previous) {
        queryClient.setQueryData(
          ["tasks", projectId],
          previous.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        );
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks", projectId], context.previous);
      }
      const apiError = toApiError(error);
      setTasksActionError(
        apiError.kind === "forbidden"
          ? "You don’t have permission to update this task."
          : apiError.message,
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/projects");
    },
    onError: (error) => {
      setDeleteProjectError(toApiError(error).message);
    },
  });

  if (projectQuery.isLoading) {
    return <LoadingState label="Loading project…" />;
  }

  if (projectQuery.isError) {
    const err = toApiError(projectQuery.error);
    if (err.kind === "not_found") {
      return (
        <EmptyState
          title="Project not found"
          description="The project you’re looking for doesn’t exist (or you don’t have access)."
          actionLabel="Back to dashboard"
          actionHref="/projects"
        />
      );
    }
    return (
      <ErrorState
        message={err.message}
        actionLabel="Retry"
        onAction={() => void projectQuery.refetch()}
      />
    );
  }

  const project = projectQuery.data;
  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="The project you’re looking for doesn’t exist (or you don’t have access)."
        actionLabel="Back to dashboard"
        actionHref="/projects"
      />
    );
  }

  async function handleSaveTask(next: Omit<Task, "id">, existingId?: string) {
    if (existingId) {
      await updateTaskMutation.mutateAsync({ taskId: existingId, patch: next });
      return;
    }
    await createTaskMutation.mutateAsync(next);
  }

  function openCreateTask(status: TaskStatus = "todo") {
    setTaskModalMode("create");
    setEditingTask(null);
    setDefaultStatus(status);
    setTaskModalOpen(true);
  }

  function handleDeleteProject() {
    const ok = window.confirm(
      `Delete "${project!.name}"? All tasks in this project will be permanently removed.`,
    );
    if (!ok) return;
    setDeleteProjectError(null);
    deleteProjectMutation.mutate();
  }

  return (
    <>
      <div className="board-view" style={{ flex: 1, minHeight: 0 }}>
        <div className="board-header">
          <div className="breadcrumb">
            <button type="button" className="breadcrumb__link" onClick={() => navigate("/projects")}>
              Dashboard
            </button>
            <ChevronRight size={12} color="var(--secondary)" />
            <span style={{ fontWeight: 500, color: "var(--ink)" }}>{project.name}</span>
          </div>

          <div className="board-title-row" style={{ marginBottom: 13 }}>
            <span className="board-title-dot" style={{ background: projectColor }} />
            <h1 className="board-title">{project.name}</h1>
            <ChevronDown size={14} color="var(--secondary)" />
          </div>
          {queryIsActive && tasks.length > 0 ? (
            <p className="dashboard-subtitle" style={{ marginTop: -8, marginBottom: 8 }}>
              Showing {filtered.length} of {tasks.length} tasks
            </p>
          ) : null}
        </div>

        <div className="board-toolbar">
          <button type="button" className="btn btn-primary btn-primary--sm" onClick={() => openCreateTask()}>
            <Plus size={12} strokeWidth={2.5} />
            New task
          </button>
          <div className="toolbar-separator" />
          <button
            type="button"
            className={`toolbar-btn${activeFilterCount > 0 ? " toolbar-btn--active" : ""}`}
            onClick={openFilterPanel}
          >
            <Filter size={13} />
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <button
            type="button"
            className={`toolbar-btn${sortIsActive ? " toolbar-btn--active" : ""}`}
            onClick={openSortPanel}
          >
            <ArrowUpDown size={13} />
            Sort
          </button>
          <Can permission="manageProjectMembers">
            <button
              type="button"
              className={`toolbar-btn${membersOpen ? " toolbar-btn--active" : ""}`}
              onClick={() => {
                setMembersOpen(true);
                setFilterOpen(false);
                setSortOpen(false);
              }}
            >
              <Users size={13} />
              Members
            </button>
          </Can>
          <Can permission="deleteProject">
            <button
              type="button"
              className="toolbar-btn toolbar-btn--danger"
              onClick={handleDeleteProject}
              disabled={deleteProjectMutation.isPending}
              aria-label="Delete project"
            >
              <Trash2 size={13} />
              Delete project
            </button>
          </Can>
        </div>

        {deleteProjectError ? (
          <div className="alert-error" style={{ margin: "8px 24px 0" }}>
            {deleteProjectError}
          </div>
        ) : null}

        {tasksActionError ? (
          <div className="alert-error" style={{ margin: "8px 24px 0" }}>
            {tasksActionError}
          </div>
        ) : null}

        <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
          {tasksQuery.isLoading ? (
            <LoadingState label="Loading tasks…" />
          ) : tasksQuery.isError ? (
            <ErrorState
              message={toApiError(tasksQuery.error).message}
              actionLabel="Retry"
              onAction={() => void tasksQuery.refetch()}
            />
          ) : tasks.length === 0 ? (
            <div className="page-scroll" style={{ flex: 1 }}>
              <EmptyState
                title="No tasks yet"
                description="Create your first task to start tracking work in this project."
                actionLabel="Create task"
                onAction={() => openCreateTask()}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="page-scroll" style={{ flex: 1 }}>
              <EmptyState
                title="No tasks match your filters or sort"
                description="Try changing your filter or sort settings."
                actionLabel="Clear filters and sort"
                onAction={clearFiltersAndSort}
              />
            </div>
          ) : (
            <KanbanBoard
              tasks={filtered}
              currentUserId={currentUserId}
              userName={userName}
              onAddTask={openCreateTask}
              onEditTask={(task) => {
                setTaskModalMode("edit");
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
            />
          )}

          {filterOpen ? (
            <FilterPanel
              tasks={tasks}
              state={draftFilterState}
              currentUserId={currentUserId}
              assignees={membersQuery.data ?? []}
              onChange={(next) => setDraftFilterState((s) => ({ ...s, ...next }))}
              onClear={() => setDraftFilterState(DEFAULT_TASK_FILTERS)}
              onApply={applyFilters}
              onClose={cancelFilters}
            />
          ) : null}
          {sortOpen ? (
            <SortPanel
              state={draftSortState}
              options={PROJECT_SORT_OPTIONS}
              onChange={(next) => setDraftSortState((s) => ({ ...s, ...next }))}
              onClear={() => setDraftSortState(DEFAULT_SORT)}
              onApply={applySort}
              onClose={cancelSort}
            />
          ) : null}
          {membersOpen ? (
            <ProjectMembersPanel
              projectId={projectId}
              onClose={() => setMembersOpen(false)}
            />
          ) : null}
        </div>
      </div>

      <TaskModal
        open={taskModalOpen}
        mode={taskModalMode}
        task={editingTask}
        currentUserId={currentUserId}
        assignees={membersQuery.data ?? []}
        defaultStatus={defaultStatus}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={(taskId) => deleteTaskMutation.mutateAsync(taskId)}
      />
    </>
  );
}
