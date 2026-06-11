import LogoutIcon from "@mui/icons-material/Logout";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../modules/auth/context/useAuth.ts";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 0, sm: 2 },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              TaskFlow
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                {user?.name ?? "—"}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={() => {
                  void logout().finally(() => navigate("/login"));
                }}
              >
                Logout
              </Button>
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Container>
    </>
  );
}

