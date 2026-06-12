import { CheckSquare, Home, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { listProjects } from "../../api/projects.api";
import { projectVisuals } from "../theme/design";

export function Sidebar({
  onNewProject,
}: {
  onNewProject: () => void;
}) {
  const location = useLocation();
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  const projects = projectsQuery.data ?? [];
  const isDashboard = location.pathname === "/projects" || location.pathname === "/dashboard";

  return (
    <aside className="sidebar">
      <div className="sidebar__nav">
        <NavLink
          to="/projects"
          className={`sidebar-nav-item${isDashboard ? " sidebar-nav-item--active" : ""}`}
        >
          <Home size={15} />
          Dashboard
        </NavLink>
        <button type="button" className="sidebar-nav-item">
          <CheckSquare size={15} />
          My tasks
        </button>
      </div>

      <div className="sidebar__divider" />

      <div className="sidebar__projects">
        <div className="sidebar__section-header">
          <span className="sidebar__section-label">Projects</span>
          <button
            type="button"
            className="icon-btn icon-btn--sm"
            style={{ width: 20, height: 20, color: "var(--blue)" }}
            onClick={onNewProject}
            aria-label="New project"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>

        {projects.map((project, index) => {
          const { color } = projectVisuals(index);
          const active = location.pathname === `/projects/${project.id}`;
          return (
            <NavLink
              key={project.id}
              to={`/projects/${project.id}`}
              className={`sidebar-project-item${active ? " sidebar-project-item--active" : ""}`}
            >
              <span
                className="sidebar-project-item__dot"
                style={{ background: color }}
              />
              <span className="sidebar-project-item__name">{project.name}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          className="sidebar-project-item"
          style={{ color: "var(--blue)", fontWeight: 500, marginTop: 4 }}
          onClick={onNewProject}
        >
          <Plus size={13} strokeWidth={2.5} />
          New project
        </button>
      </div>
    </aside>
  );
}
