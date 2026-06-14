import { useNavigate } from "react-router-dom";

import {
  PRIORITY_META,
  TASK_STATUS_COLUMNS,
  formatDueDate,
} from "../../shared/theme/design";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { toApiError } from "../../shared/utils/apiErrors";
import { useAuth } from "../../modules/auth/context/useAuth";
import { useMyTasks } from "../../modules/tasks/hooks/useMyTasks";
import type { AssignedTask } from "../../types/tasks";

const STATUS_BY_ID = Object.fromEntries(
  TASK_STATUS_COLUMNS.map((col) => [col.id, col]),
);

export function MyTasksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks, isLoading, isError, error, refetch } = useMyTasks(user?.id);

  if (isLoading) {
    return (
      <div className="page-scroll">
        <LoadingState label="Loading your tasks…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-scroll">
        <ErrorState
          message={toApiError(error).message}
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";

  function openProject(task: AssignedTask) {
    navigate(`/projects/${task.projectId}`);
  }

  return (
    <div className="page-scroll">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">My tasks</h1>
          <p className="dashboard-subtitle">
            {tasks.length} task{tasks.length === 1 ? "" : "s"} assigned to you
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks assigned"
          description={`Nothing is assigned to you yet, ${firstName}. Tasks assigned to you across your projects will appear here.`}
          actionLabel="Go to dashboard"
          actionHref="/projects"
        />
      ) : (
        <div className="users-table-wrap">
          <table className="users-table my-tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const status = STATUS_BY_ID[task.status];
                const priority = PRIORITY_META[task.priority];

                return (
                  <tr
                    key={task.id}
                    className="my-tasks-table__row"
                    onClick={() => openProject(task)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") openProject(task);
                    }}
                    tabIndex={0}
                  >
                    <td className="my-tasks-table__title">{task.title}</td>
                    <td>{task.projectName}</td>
                    <td>
                      <span
                        className="my-tasks-table__status"
                        style={{
                          background: `${status.color}22`,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <span
                        className="priority-badge"
                        style={{
                          background: priority.bg,
                          color: priority.color,
                        }}
                      >
                        {priority.label}
                      </span>
                    </td>
                    <td className="my-tasks-table__due">
                      {task.dueDate ? formatDueDate(task.dueDate) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
