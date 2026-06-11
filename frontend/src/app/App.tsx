import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "../shared/layouts/ProtectedRoute";
import { Navbar } from "../shared/layouts/Navbar";
import { EmptyState } from "../shared/ui/EmptyState";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ProjectsListPage } from "../pages/projects/ProjectsListPage";
import { ProjectDetailPage } from "../pages/projects/ProjectDetailPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Navbar />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
      </Route>

      <Route
        path="*"
        element={
          <EmptyState
            title="Not found"
            description="The page you’re looking for doesn’t exist."
            actionLabel="Go to projects"
            actionHref="/projects"
          />
        }
      />
    </Routes>
  );
}

