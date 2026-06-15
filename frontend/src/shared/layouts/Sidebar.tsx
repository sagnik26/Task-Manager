"use client";

import { CheckSquare, Home, Plus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useProjects } from "@/modules/projects";
import { Can } from "@/shared/permissions/Can";
import { projectVisuals } from "@/shared/theme/design";

export function Sidebar({
  onNewProject,
}: {
  onNewProject: () => void;
}) {
  const pathname = usePathname();
  const projectsQuery = useProjects();

  const projects = projectsQuery.data ?? [];
  const isDashboard =
    pathname === "/projects" || pathname === "/dashboard";
  const isUsers = pathname === "/users";
  const isMyTasks = pathname === "/my-tasks";

  return (
    <aside className="sidebar">
      <div className="sidebar__nav">
        <Link
          href="/projects"
          className={`sidebar-nav-item${isDashboard ? " sidebar-nav-item--active" : ""}`}
        >
          <Home size={15} />
          Dashboard
        </Link>
        <Can permission="manageUsers">
          <Link
            href="/users"
            className={`sidebar-nav-item${isUsers ? " sidebar-nav-item--active" : ""}`}
          >
            <Users size={15} />
            Users
          </Link>
        </Can>
        <Link
          href="/my-tasks"
          className={`sidebar-nav-item${isMyTasks ? " sidebar-nav-item--active" : ""}`}
        >
          <CheckSquare size={15} />
          My tasks
        </Link>
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
          const active = pathname === `/projects/${project.id}`;
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={`sidebar-project-item${active ? " sidebar-project-item--active" : ""}`}
            >
              <span
                className="sidebar-project-item__dot"
                style={{ background: color }}
              />
              <span className="sidebar-project-item__name">{project.name}</span>
            </Link>
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
