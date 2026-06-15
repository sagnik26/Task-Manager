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
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/modules/auth";
import { ProjectMembersPanel } from "@/modules/projects/components/ProjectMembersPanel";
import {
  getProject,
  listProjectMembers,
  listProjects,
} from "@/modules/projects/api/projects.api";
import { projectKeys } from "@/modules/projects/api/query-keys";
import { useDeleteProject } from "@/modules/projects/hooks/useDeleteProject";
import { Can } from "@/shared/permissions/Can";
import { listTasks } from "@/modules/tasks/api/tasks.api";
import { taskKeys } from "@/modules/tasks/api/query-keys";
import { KanbanBoard } from "@/modules/tasks/components/KanbanBoard";
import {
  DEFAULT_TASK_FILTERS,
  FilterPanel,
  type TaskFilterState,
} from "@/modules/tasks/components/FilterPanel";
import {
  DEFAULT_SORT,
  SortPanel,
  type SortState,
} from "@/modules/tasks/components/SortPanel";
import { TaskModal } from "@/modules/tasks/components/TaskModal";
import { DeleteConfirmModal } from "@/shared/ui/DeleteConfirmModal";
import {
  buildOptimisticTaskPayload,
  useCreateTask,
} from "@/modules/tasks/hooks/useCreateTask";
import { useDeleteTask } from "@/modules/tasks/hooks/useDeleteTask";
import { useUpdateTask } from "@/modules/tasks/hooks/useUpdateTask";
import {
  applyTaskQuery,
  countActiveFilters,
  isQueryActive,
  isSortActive,
} from "@/modules/tasks/utils/applyTaskQuery";
import { PROJECT_SORT_OPTIONS, projectVisuals } from "@/shared/theme/design";
import { toApiError } from "@/shared/utils/apiErrors";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import type { Task, TaskStatus } from "@/modules/tasks/types/tasks.types";

export function ProjectDetailScreen({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id ?? "me";
  const userName = user?.name ?? "Me";

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
  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);
  const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [tasksActionError, setTasksActionError] = useState<string | null>(null);
  const [deleteProjectError, setDeleteProjectError] = useState<string | null>(null);

  const updateTaskMutation = useUpdateTask(projectId, {
    onError: (message) => setTasksActionError(message),
  });
  const createTaskMutation = useCreateTask(projectId, {
    onError: (message) => setTasksActionError(message),
  });
  const deleteTaskMutation = useDeleteTask(projectId, {
    onError: (message) => setTasksActionError(message),
  });
  const deleteProjectMutation = useDeleteProject({
    onSuccess: () => navigate("/projects"),
    onError: (message) => setDeleteProjectError(message),
  });

  const projectQuery = useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });

  const projectsQuery = useQuery({
    queryKey: projectKeys.all,
    queryFn: listProjects,
  });

  const tasksQuery = useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => listTasks(projectId, {}),
    enabled: Boolean(projectId),
  });

  const membersQuery = useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: () => listProjectMembers(projectId),
    enabled: Boolean(projectId),
  });

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

  function handleSaveTask(next: Omit<Task, "id">, existingId?: string) {
    setTasksActionError(null);
    if (existingId) {
      updateTaskMutation.mutate({ taskId: existingId, patch: next });
      return;
    }
    createTaskMutation.mutate(buildOptimisticTaskPayload(next));
  }

  function openCreateTask(status: TaskStatus = "todo") {
    setTaskModalMode("create");
    setEditingTask(null);
    setDefaultStatus(status);
    setTaskModalOpen(true);
  }

  function openDeleteProjectModal() {
    setDeleteProjectError(null);
    setDeleteProjectModalOpen(true);
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
              onClick={openDeleteProjectModal}
              aria-label="Delete project"
            >
              <Trash2 size={13} />
              Delete project
            </button>
          </Can>
        </div>

        {tasksActionError ? (
          <div className="alert-error" style={{ margin: "8px 24px 0" }}>
            {tasksActionError}
          </div>
        ) : null}
        {deleteProjectError ? (
          <div className="alert-error" style={{ margin: "8px 24px 0" }}>
            {deleteProjectError}
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
              assignees={membersQuery.data ?? []}
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
        onRequestDelete={(task) => setTaskPendingDelete(task)}
      />

      <DeleteConfirmModal
        open={Boolean(taskPendingDelete)}
        title="Delete task"
        itemName={taskPendingDelete?.title}
        confirmLabel="Delete task"
        onClose={() => setTaskPendingDelete(null)}
        onConfirm={() => {
          if (!taskPendingDelete) return;
          setTasksActionError(null);
          deleteTaskMutation.mutate(taskPendingDelete.id);
        }}
      />

      <DeleteConfirmModal
        open={deleteProjectModalOpen}
        title="Delete project"
        itemName={project.name}
        detail="All tasks in this project will be permanently removed."
        confirmLabel="Delete project"
        onClose={() => setDeleteProjectModalOpen(false)}
        onConfirm={() => {
          setDeleteProjectError(null);
          deleteProjectMutation.mutate(project.id);
        }}
      />
    </>
  );
}
