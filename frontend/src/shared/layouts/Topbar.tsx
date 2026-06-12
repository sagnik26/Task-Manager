import { useNavigate } from "react-router-dom";

import { useAuth } from "../../modules/auth/context/useAuth";
import { Avatar } from "../ui/Avatar";
import { DarkModeToggle } from "../ui/DarkModeToggle";
import { LogoIcon, LogoWordmark } from "../ui/Logo";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        <button
          type="button"
          className="btn-ghost"
          style={{ padding: 0, marginLeft: 10, borderRadius: "50%" }}
          onClick={() => void logout().finally(() => navigate("/login"))}
          title={user?.name ?? "Account"}
        >
          <Avatar name={user?.name ?? "User"} seed={user?.id} size={30} />
        </button>
      </div>
    </header>
  );
}
