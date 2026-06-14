import { Link as RouterLink } from "react-router-dom";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  const action =
    actionLabel && actionHref ? (
      <RouterLink to={actionHref} className="btn btn-primary btn-primary--md">
        {actionLabel}
      </RouterLink>
    ) : actionLabel && onAction ? (
      <button type="button" className="btn btn-primary btn-primary--md" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null;

  return (
    <div className="state-panel">
      <h3 className="state-panel__title">{title}</h3>
      {description ? <p className="state-panel__desc">{description}</p> : null}
      {action}
    </div>
  );
}
