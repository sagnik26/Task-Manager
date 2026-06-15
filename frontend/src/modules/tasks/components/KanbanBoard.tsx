import { Calendar } from "lucide-react";

import {
  PRIORITY_META,
  TASK_STATUS_COLUMNS,
  formatDueDate,
} from "@/shared/theme/design";
import { Avatar } from "@/shared/ui/Avatar";
import type { ProjectMember } from "@/modules/projects/types/projects.types";
import type { Task } from "@/modules/tasks/types/tasks.types";

function resolveAssigneeLabel(
  assigneeId: string,
  currentUserId: string,
  userName: string,
  members: ProjectMember[],
): string {
  if (assigneeId === currentUserId) return userName;
  return members.find((member) => member.userId === assigneeId)?.name ?? "Assigned";
}

export function KanbanBoard({
  tasks,
  currentUserId,
  userName,
  assignees = [],
  onEditTask,
}: {
  tasks: Task[];
  currentUserId: string;
  userName: string;
  assignees?: ProjectMember[];
  onEditTask: (task: Task) => void;
}) {
  return (
    <div className="kanban-area">
      {TASK_STATUS_COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="kanban-column">
            <div
              className="kanban-column__header"
              style={{ borderBottom: `3px solid ${col.color}` }}
            >
              <span className="kanban-column__dot" style={{ background: col.color }} />
              <span className="kanban-column__label">{col.label}</span>
              <span className="kanban-column__count">{columnTasks.length}</span>
            </div>

            <div className="kanban-column__list">
              {columnTasks.map((task) => {
                const pm = PRIORITY_META[task.priority];
                const assigneeId = task.assigneeId;

                return (
                  <div
                    key={task.id}
                    className="task-card"
                    style={{ borderLeft: `3px solid ${pm.color}` }}
                    onClick={() => onEditTask(task)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onEditTask(task);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <p className="task-card__title">{task.title}</p>

                    <div className="task-card__footer">
                      <span
                        className="priority-badge"
                        style={{ background: pm.bg, color: pm.color }}
                      >
                        {pm.label}
                      </span>

                      <div className="task-card__meta">
                        {task.dueDate ? (
                          <span className="task-card__meta-item">
                            <Calendar size={10} />
                            {formatDueDate(task.dueDate)}
                          </span>
                        ) : null}
                        {assigneeId ? (
                          <Avatar
                            name={resolveAssigneeLabel(
                              assigneeId,
                              currentUserId,
                              userName,
                              assignees,
                            )}
                            seed={assigneeId}
                            size={20}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        );
      })}
    </div>
  );
}
