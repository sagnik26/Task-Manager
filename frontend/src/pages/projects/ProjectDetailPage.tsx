import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Divider,
  Alert,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../modules/auth/context/useAuth.ts";
import { getProject } from "../../api/projects.api";
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
import {
  TaskFilters,
  type TaskAssigneeFilter,
} from "../../modules/tasks/components/TaskFilters.tsx";
import { TaskList } from "../../modules/tasks/components/TaskList.tsx";
import { TaskModal } from "../../modules/tasks/components/TaskModal.tsx";
import type { Task, TaskStatus } from "../../types/tasks";

export function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id ?? "";

  const { user } = useAuth();
  const currentUserId = user?.id ?? "me";

  const queryClient = useQueryClient();
  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });

  const [filters, setFilters] = useState<{
    status: TaskStatus | "all";
    assignee: TaskAssigneeFilter;
  }>({ status: "all", assignee: "all" });

  const tasksQuery = useQuery({
    queryKey: ["tasks", projectId, filters],
    queryFn: () =>
      listTasks(projectId, {
        status: filters.status === "all" ? undefined : filters.status,
        // Backend only accepts a UUID here; "unassigned" is handled client-side below.
        assignee: filters.assignee === "me" ? currentUserId : undefined,
      }),
    enabled: Boolean(projectId),
  });

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasksActionError, setTasksActionError] = useState<string | null>(null);

  const tasks = useMemo(() => {
    return (tasksQuery.data ?? []) as Task[];
  }, [tasksQuery.data]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.assignee === "unassigned" && t.assigneeId !== null)
        return false;
      return true;
    });
  }, [filters.assignee, tasks]);

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
      const previous = queryClient.getQueryData([
        "tasks",
        projectId,
        filters,
      ]) as Task[] | undefined;
      if (previous) {
        queryClient.setQueryData(["tasks", projectId, filters], (curr) => {
          const list = (curr as Task[] | undefined) ?? [];
          return list.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["tasks", projectId, filters],
          context.previous,
        );
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
          actionLabel="Back to projects"
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
        actionLabel="Back to projects"
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

  async function handleDeleteTask(taskId: string) {
    await deleteTaskMutation.mutateAsync(taskId);
  }

  return (
    <Box sx={{ display: "grid", gap: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Button
          component={RouterLink}
          to="/projects"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Projects
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setTaskModalMode("create");
            setEditingTask(null);
            setTaskModalOpen(true);
          }}
        >
          Create task
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 850 }}>
          {project.name}
        </Typography>
        {project.description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {project.description}
          </Typography>
        ) : null}
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Tasks
          </Typography>
          {tasksActionError ? (
            <Alert severity="error">{tasksActionError}</Alert>
          ) : null}
          <TaskFilters
            status={filters.status}
            assignee={filters.assignee}
            onChange={(next) => setFilters(next)}
          />

          <Divider />

          {tasksQuery.isLoading ? (
            <LoadingState label="Loading tasks…" />
          ) : tasksQuery.isError ? (
            <ErrorState
              message={toApiError(tasksQuery.error).message}
              actionLabel="Retry"
              onAction={() => void tasksQuery.refetch()}
            />
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Create your first task to start tracking work in this project."
              actionLabel="Create task"
              onAction={() => {
                setTaskModalMode("create");
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No tasks match your filters"
              description="Try changing status or assignee filters."
              actionLabel="Reset filters"
              onAction={() => setFilters({ status: "all", assignee: "all" })}
            />
          ) : (
            <TaskList
              tasks={filtered}
              currentUserId={currentUserId}
              onEdit={(task) => {
                setTaskModalMode("edit");
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
              onChangeStatus={(taskId, status) => {
                void updateTaskMutation.mutateAsync({
                  taskId,
                  patch: { status },
                });
              }}
            />
          )}
        </Stack>
      </Paper>

      <TaskModal
        open={taskModalOpen}
        mode={taskModalMode}
        task={editingTask}
        currentUserId={currentUserId}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </Box>
  );
}
