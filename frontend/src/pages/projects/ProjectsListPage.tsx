import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { LoadingState } from "../../shared/ui/LoadingState";
import {
  CreateProjectModal,
  type CreateProjectValues,
} from "../../modules/projects/components/CreateProjectModal";
import type { Project } from "../../types/projects";
import { createProject, listProjects } from "../../api/projects.api";
import { toApiError } from "../../shared/utils/apiErrors";

export function ProjectsListPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  const sorted = useMemo(() => {
    const list = (projectsQuery.data ?? []) as Project[];
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [projectsQuery.data]);

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  async function onCreate(values: CreateProjectValues) {
    await createMutation.mutateAsync({
      name: values.name,
      description: values.description ? values.description : null,
    });
  }

  if (projectsQuery.isLoading) {
    return <LoadingState label="Loading projects…" />;
  }

  if (projectsQuery.isError) {
    const err = toApiError(projectsQuery.error);
    return (
      <ErrorState
        message={err.message}
        actionLabel="Retry"
        onAction={() => void projectsQuery.refetch()}
      />
    );
  }

  const hasProjects = sorted.length > 0;

  return (
    <Box sx={{ display: "grid", gap: 2.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a project, then add tasks to keep work moving.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Create project
        </Button>
      </Stack>

      {!hasProjects ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking tasks."
          actionLabel="Create project"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Grid container spacing={2}>
            {sorted.map((p) => (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    transition: "transform 120ms ease, box-shadow 120ms ease",
                    "&:hover": { transform: "translateY(-1px)" },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/projects/${p.id}`)}
                    sx={{ height: "100%" }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {p.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.75 }}
                      >
                        {p.description ?? "No description"}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={onCreate}
      />
    </Box>
  );
}

