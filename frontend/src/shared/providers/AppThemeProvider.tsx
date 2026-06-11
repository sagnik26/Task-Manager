import type { ReactNode } from "react";
import { useMemo } from "react";
import { ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import { alpha } from "@mui/material/styles";

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const surface = prefersDarkMode ? "#1C1B1F" : "#FFFBFE";
  const surfaceContainerLowest = prefersDarkMode ? "#0F0E11" : "#FFFFFF";
  const surfaceContainerLow = prefersDarkMode ? "#242228" : "#F7F2FA";
  const outlineVariant = prefersDarkMode ? "#49454F" : "#CAC4D0";

  const inputBg = surfaceContainerLow;
  const appBarBg = alpha(surface, 0.78);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: { main: "#6750A4" }, // M3 seed-ish purple
          secondary: { main: "#625B71" },
          background: prefersDarkMode
            ? { default: surface, paper: surfaceContainerLow }
            : { default: surface, paper: surfaceContainerLowest },
          divider: outlineVariant,
          action: {
            hover: alpha("#6750A4", prefersDarkMode ? 0.14 : 0.08),
            selected: alpha("#6750A4", prefersDarkMode ? 0.22 : 0.12),
            focus: alpha("#6750A4", prefersDarkMode ? 0.18 : 0.12),
          },
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
          button: {
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: 0.2,
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: surface,
              },
              // Prevent Chromium/Safari from painting autofilled inputs blue/yellow.
              // Needs very specific selectors + !important to win over UA styles.
              "input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active":
                {
                  WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset !important`,
                  boxShadow: `0 0 0 1000px ${inputBg} inset !important`,
                  WebkitTextFillColor: "currentColor !important",
                  caretColor: "currentColor !important",
                  transition: "background-color 9999s ease-out 0s",
                },
              "textarea:-webkit-autofill, textarea:-webkit-autofill:hover, textarea:-webkit-autofill:focus, textarea:-webkit-autofill:active":
                {
                  WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset !important`,
                  boxShadow: `0 0 0 1000px ${inputBg} inset !important`,
                  WebkitTextFillColor: "currentColor !important",
                  caretColor: "currentColor !important",
                  transition: "background-color 9999s ease-out 0s",
                },
              "select:-webkit-autofill, select:-webkit-autofill:hover, select:-webkit-autofill:focus, select:-webkit-autofill:active":
                {
                  WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset !important`,
                  boxShadow: `0 0 0 1000px ${inputBg} inset !important`,
                  WebkitTextFillColor: "currentColor !important",
                  caretColor: "currentColor !important",
                  transition: "background-color 9999s ease-out 0s",
                },
              ".MuiInputBase-input:-webkit-autofill, .MuiInputBase-input:-webkit-autofill:hover, .MuiInputBase-input:-webkit-autofill:focus, .MuiInputBase-input:-webkit-autofill:active":
                {
                  WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset !important`,
                  boxShadow: `0 0 0 1000px ${inputBg} inset !important`,
                  WebkitTextFillColor: "currentColor !important",
                  caretColor: "currentColor !important",
                  transition: "background-color 9999s ease-out 0s",
                },
            },
          },
          MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
              root: {
                backgroundImage: "none",
                backgroundColor: surfaceContainerLow,
              },
            },
          },
          MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
              root: {
                borderRadius: 16,
                backgroundColor: surfaceContainerLow,
              },
            },
          },
          MuiAppBar: {
            defaultProps: { elevation: 0, color: "transparent" },
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 999,
              },
              contained: ({ theme }) => ({
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.82 : 0.9,
                  ),
                },
              }),
              outlined: ({ theme }) => ({
                borderColor: theme.palette.divider,
                "&:hover": {
                  borderColor: theme.palette.divider,
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.16 : 0.08,
                  ),
                },
              }),
              text: ({ theme }) => ({
                "&:hover": {
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.16 : 0.08,
                  ),
                },
              }),
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: ({ theme }) => ({
                borderRadius: 999,
                "&:hover": {
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.16 : 0.08,
                  ),
                },
              }),
            },
          },
          MuiChip: {
            styleOverrides: {
              root: ({ ownerState, theme }) => ({
                borderRadius: 999,
                fontWeight: 600,
                ...(ownerState.variant === "filled" &&
                  ownerState.color === "warning" && {
                    color: theme.palette.common.white,
                  }),
              }),
              filled: ({ theme }) => ({
                backgroundColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === "dark" ? 0.22 : 0.12,
                ),
              }),
            },
          },
          MuiToolbar: {
            styleOverrides: {
              root: {
                backgroundColor: appBarBg,
                borderBottom: `1px solid ${outlineVariant}`,
                backdropFilter: "saturate(140%) blur(10px)",
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              variant: "outlined",
              size: "small",
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: ({ theme }) => ({
                borderRadius: 16,
                backgroundColor: surfaceContainerLowest,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(
                    theme.palette.text.primary,
                    theme.palette.mode === "dark" ? 0.4 : 0.35,
                  ),
                },
              }),
              notchedOutline: {
                borderColor: outlineVariant,
              },
            },
          },
          MuiSelect: {
            defaultProps: {
              variant: "outlined",
              size: "small",
            },
          },
        },
      }),
    [
      appBarBg,
      inputBg,
      outlineVariant,
      prefersDarkMode,
      surface,
      surfaceContainerLow,
      surfaceContainerLowest,
    ],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
