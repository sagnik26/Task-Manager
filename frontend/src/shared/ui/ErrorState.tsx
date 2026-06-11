import { Alert, Box, Button } from "@mui/material";

export function ErrorState({
  message = "Something went wrong.",
  actionLabel,
  onAction,
}: {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Box sx={{ py: 4 }}>
      <Alert
        severity="error"
        action={
          actionLabel && onAction ? (
            <Button color="inherit" size="small" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : undefined
        }
      >
        {message}
      </Alert>
    </Box>
  );
}

