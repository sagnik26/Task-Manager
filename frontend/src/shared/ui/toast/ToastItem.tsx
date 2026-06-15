import { AlertCircle, CheckCircle2, X } from "lucide-react";

import type { Toast } from "./toast.types";

export function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const Icon = toast.type === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`toast toast--${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <Icon size={16} className="toast__icon" aria-hidden />
      <p className="toast__message">{toast.message}</p>
      <button
        type="button"
        className="toast__dismiss"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
