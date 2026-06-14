export function ErrorState({
  message = "Something went wrong.",
  actionLabel,
  onAction,
}: {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="state-panel">
      <h3 className="state-panel__title">Error</h3>
      <p className="state-panel__desc">{message}</p>
      {actionLabel && onAction ? (
        <button type="button" className="btn btn-primary btn-primary--md" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
