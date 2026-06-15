"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/modules/auth";
import type { UserRole } from "@/modules/auth/types/auth.types";
import { Avatar } from "../ui/Avatar";
import { DarkModeToggle } from "../ui/DarkModeToggle";
import { LogoIcon, LogoWordmark } from "../ui/Logo";

function roleLabel(role: UserRole | undefined): string {
  return role === "admin" ? "Admin" : "Developer";
}

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    void logout().finally(() => router.push("/login"));
  };

  return (
    <header className="topbar">
      <div className="logo" style={{ gap: 9 }}>
        <LogoIcon size={28} />
        <LogoWordmark size="sm" />
      </div>

      <div className="flex-1" />

      <div className="topbar__actions">
        <DarkModeToggle />
        <div className="topbar__divider" />

        <div className="profile-menu" ref={menuRef}>
          <button
            type="button"
            className="profile-menu__trigger btn-ghost"
            style={{ padding: 0, marginLeft: 10, borderRadius: "50%" }}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Open account menu"
          >
            <Avatar name={user?.name ?? "User"} seed={user?.id} size={30} />
          </button>

          {menuOpen ? (
            <div className="profile-menu__panel" role="menu">
              <div className="profile-menu__header">
                <Avatar name={user?.name ?? "User"} seed={user?.id} size={36} />
                <div className="profile-menu__meta">
                  <div className="profile-menu__name-row">
                    <div className="profile-menu__name">{user?.name ?? "User"}</div>
                    {user?.role ? (
                      <span className={`users-badge users-badge--${user.role} profile-menu__role`}>
                        {roleLabel(user.role)}
                      </span>
                    ) : null}
                  </div>
                  <div className="profile-menu__email">{user?.email ?? ""}</div>
                </div>
              </div>

              <div className="profile-menu__divider" />

              <button
                type="button"
                className="profile-menu__item"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
