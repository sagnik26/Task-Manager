import { Calendar, Plus } from "lucide-react";

import {
  PRIORITY_META,
  TASK_STATUS_COLUMNS,
  formatDueDate,
} from "../../../shared/theme/design";
import { Avatar } from "../../../shared/ui/Avatar";
import type { Task, TaskStatus } from "../../../types/tasks";

export function KanbanBoard({
  tasks,
  currentUserId,
  userName,
  onAddTask,
  onEditTask,
}: {
  tasks: Task[];
  currentUserId: string;
  userName: string;
  onAddTask: (status: TaskStatus) => void;
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
              <button
                type="button"
                className="icon-btn icon-btn--sm"
                style={{ width: 22, height: 22 }}
                onClick={() => onAddTask(col.id)}
                aria-label={`Add task to ${col.label}`}
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </div>

            <div className="kanban-column__list">
              {columnTasks.map((task) => {
                const pm = PRIORITY_META[task.priority];
                const isAssignedToMe = task.assigneeId === currentUserId;

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
                        {isAssignedToMe ? (
                          <Avatar name={userName} seed={currentUserId} size={20} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                className="add-task-btn"
                onClick={() => onAddTask(col.id)}
              >
                <Plus size={11} strokeWidth={2.5} />
                Add task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
