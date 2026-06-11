import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import type { TaskStatus } from "../../../types/tasks";

export type TaskAssigneeFilter = "all" | "me" | "unassigned";

export function TaskFilters({
  status,
  assignee,
  onChange,
}: {
  status: TaskStatus | "all";
  assignee: TaskAssigneeFilter;
  onChange: (next: { status: TaskStatus | "all"; assignee: TaskAssigneeFilter }) => void;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      <FormControl fullWidth size="small">
        <InputLabel id="task-status-label">Status</InputLabel>
        <Select
          labelId="task-status-label"
          label="Status"
          value={status}
          onChange={(e) =>
            onChange({
              status: e.target.value as TaskStatus | "all",
              assignee,
            })
          }
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="todo">Todo</MenuItem>
          <MenuItem value="in_progress">In progress</MenuItem>
          <MenuItem value="done">Done</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="task-assignee-label">Assignee</InputLabel>
        <Select
          labelId="task-assignee-label"
          label="Assignee"
          value={assignee}
          onChange={(e) =>
            onChange({
              status,
              assignee: e.target.value as TaskAssigneeFilter,
            })
          }
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="me">Me</MenuItem>
          <MenuItem value="unassigned">Unassigned</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

