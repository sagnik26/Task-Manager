import { Box, CircularProgress, Typography } from "@mui/material";

export function LoadingState({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <Box
      sx={{
        py: 6,
        display: "grid",
        placeItems: "center",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

