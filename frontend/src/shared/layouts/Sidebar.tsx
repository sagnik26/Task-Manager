import { CheckSquare, Home, Plus, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { listProjects } from "../../api/projects.api";
import { Can } from "../permissions/Can";
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
  const isDashboard =
    location.pathname === "/projects" || location.pathname === "/dashboard";
  const isUsers = location.pathname === "/users";
  const isMyTasks = location.pathname === "/my-tasks";

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
        <Can permission="manageUsers">
          <NavLink
            to="/users"
            className={`sidebar-nav-item${isUsers ? " sidebar-nav-item--active" : ""}`}
          >
            <Users size={15} />
            Users
          </NavLink>
        </Can>
        <NavLink
          to="/my-tasks"
          className={`sidebar-nav-item${isMyTasks ? " sidebar-nav-item--active" : ""}`}
        >
          <CheckSquare size={15} />
          My tasks
        </NavLink>
      </div>

      <div className="sidebar__divider" />

      <div className="sidebar__projects">
        <div className="sidebar__section-header">
          <span className="sidebar__section-label">Projects</span>
          <Can permission="createProject">
            <button
              type="button"
              className="icon-btn icon-btn--sm"
              style={{ width: 20, height: 20, color: "var(--blue)" }}
              onClick={onNewProject}
              aria-label="New project"
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </Can>
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

        <Can permission="createProject">
          <button
            type="button"
            className="sidebar-project-item"
            style={{ color: "var(--blue)", fontWeight: 500, marginTop: 4 }}
            onClick={onNewProject}
          >
            <Plus size={13} strokeWidth={2.5} />
            New project
          </button>
        </Can>
      </div>
    </aside>
  );
}
