import { Box, Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  const action =
    actionLabel && actionHref ? (
      <Button component={RouterLink} to={actionHref} variant="contained">
        {actionLabel}
      </Button>
    ) : actionLabel && onAction ? (
      <Button onClick={onAction} variant="contained">
        {actionLabel}
      </Button>
    ) : null;

  return (
    <Paper variant="outlined" sx={{ p: 4 }}>
      <Box sx={{ display: "grid", gap: 1.5 }}>
        <Typography variant="h6">{title}</Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
        {action ? <Box sx={{ pt: 1 }}>{action}</Box> : null}
      </Box>
    </Paper>
  );
}

