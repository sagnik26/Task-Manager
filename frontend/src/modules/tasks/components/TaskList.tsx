import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import type { Task, TaskStatus } from "../../../types/tasks";

function priorityColor(
  priority: Task["priority"],
): "default" | "success" | "warning" | "error" {
  if (priority === "low") return "default";
  if (priority === "medium") return "warning";
  return "error";
}

function statusOrder(status: TaskStatus): number {
  if (status === "todo") return 0;
  if (status === "in_progress") return 1;
  return 2;
}

function sortTasksForColumn(a: Task, b: Task): number {
  if (a.priority !== b.priority) {
    const weight = (p: Task["priority"]) =>
      p === "high" ? 0 : p === "medium" ? 1 : 2;
    return weight(a.priority) - weight(b.priority);
  }
  return a.title.localeCompare(b.title);
}

export function TaskList({
  tasks,
  currentUserId,
  onEdit,
  onChangeStatus,
}: {
  tasks: Task[];
  currentUserId: string;
  onEdit: (task: Task) => void;
  onChangeStatus: (taskId: string, status: TaskStatus) => void;
}) {
  const CARD_MIN_WIDTH_PX = 320;
  const DESCRIPTION_MIN_HEIGHT_PX = 44; // ~2 lines of MUI caption to keep chips pinned

  const byStatus = tasks.reduce(
    (acc, t) => {
      acc[t.status].push(t);
      return acc;
    },
    {
      todo: [] as Task[],
      in_progress: [] as Task[],
      done: [] as Task[],
    },
  );

  const columns: Array<{ status: TaskStatus; title: string }> = [
    { status: "todo", title: "To do" },
    { status: "in_progress", title: "In progress" },
    { status: "done", title: "Done" },
  ];

  return (
    <Stack spacing={2}>
      {columns
        .sort((a, b) => statusOrder(a.status) - statusOrder(b.status))
        .map((col) => {
          const items = [...byStatus[col.status]].sort(sortTasksForColumn);
          return (
            <Paper
              key={col.status}
              variant="outlined"
              sx={{
                p: 1.5,
                bgcolor: "action.hover",
                borderColor: "divider",
              }}
            >
              <Stack spacing={1.25}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 850 }}>
                    {col.title}
                  </Typography>
                  <Chip size="small" label={items.length} />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: `repeat(2, minmax(${CARD_MIN_WIDTH_PX}px, 1fr))`,
                    },
                    gap: 1,
                    alignItems: "stretch",
                  }}
                >
                  {items.map((t) => (
                    <Card
                      key={t.id}
                      variant="outlined"
                      sx={{
                        bgcolor: "background.paper",
                        height: 170,
                        minWidth: `${CARD_MIN_WIDTH_PX}px`,
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 1.5,
                          "&:last-child": { pb: 1.5 },
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
                            gap: 1,
                            alignItems: "start",
                            height: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              height: "100%",
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 800, lineHeight: 1.25 }}
                              >
                                {t.title}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                minWidth: 0,
                                mt: 1,
                                flex: 1,
                                minHeight: `${DESCRIPTION_MIN_HEIGHT_PX}px`,
                                overflow: "hidden",
                              }}
                            >
                              {t.description ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "block",
                                    whiteSpace: "pre-wrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {t.description}
                                </Typography>
                              ) : null}
                            </Box>

                            <Stack
                              direction="row"
                              spacing={0.75}
                              sx={{ mt: "auto", pt: 1.25, flexWrap: "wrap" }}
                            >
                              <Chip
                                size="small"
                                label={t.priority}
                                color={priorityColor(t.priority)}
                                variant="filled"
                              />
                              <Chip
                                size="small"
                                label={
                                  t.assigneeId === currentUserId
                                    ? "Me"
                                    : t.assigneeId
                                      ? "Assigned"
                                      : "Unassigned"
                                }
                                variant="outlined"
                              />
                              {t.dueDate ? (
                                <Chip
                                  size="small"
                                  label={t.dueDate}
                                  variant="outlined"
                                />
                              ) : null}
                            </Stack>
                          </Box>

                          <Stack
                            direction={{ xs: "row", sm: "row" }}
                            spacing={0.5}
                            alignItems="center"
                            justifyContent={{
                              xs: "flex-start",
                              sm: "flex-end",
                            }}
                            sx={{
                              minWidth: 0,
                              flexWrap: { xs: "wrap", sm: "nowrap" },
                              justifyContent: { xs: "flex-start", sm: "flex-end" },
                              justifySelf: { xs: "start", sm: "end" },
                            }}
                          >
                            <Select
                              size="small"
                              value={t.status}
                              onChange={(e) =>
                                onChangeStatus(
                                  t.id,
                                  e.target.value as TaskStatus,
                                )
                              }
                              sx={{
                                "& .MuiSelect-select": { py: 0.75 },
                                minWidth: { xs: 160, sm: 120 },
                              }}
                            >
                              <MenuItem value="todo">Todo</MenuItem>
                              <MenuItem value="in_progress">In progress</MenuItem>
                              <MenuItem value="done">Done</MenuItem>
                            </Select>
                            <IconButton
                              aria-label="Edit task"
                              onClick={() => onEdit(t)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Stack>
            </Paper>
          );
        })}
    </Stack>
  );
}

