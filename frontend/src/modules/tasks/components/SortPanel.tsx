import { Check, X } from "lucide-react";

import {
  SORT_OPTIONS,
  type SortField,
} from "@/shared/theme/design";

export type SortState = {
  sortBy: SortField;
  sortDir: "asc" | "desc";
};

export const DEFAULT_SORT: SortState = {
  sortBy: "dueDate",
  sortDir: "asc",
};

export function SortPanel({
  state,
  options = SORT_OPTIONS,
  onChange,
  onClear,
  onApply,
  onClose,
}: {
  state: SortState;
  options?: Array<{ id: SortField; label: string }>;
  onChange: (next: Partial<SortState>) => void;
  onClear: () => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const isDefault =
    state.sortBy === DEFAULT_SORT.sortBy && state.sortDir === DEFAULT_SORT.sortDir;

  return (
    <aside className="filter-panel">
      <div className="filter-panel__header">
        <h3 className="filter-panel__title">Sort</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isDefault ? (
            <button type="button" className="btn-link" style={{ fontSize: 12 }} onClick={onClear}>
              Reset
            </button>
          ) : null}
          <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="filter-panel__body">
        <div className="filter-section" style={{ marginBottom: 4 }}>
          <h4 className="filter-section__label">Sort by</h4>
          <div className="filter-options">
            {options.map((opt) => {
              const active = state.sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`filter-sort-option${active ? " filter-sort-option--active" : ""}`}
                  onClick={() =>
                    onChange({
                      sortBy: opt.id,
                      sortDir:
                        state.sortBy === opt.id
                          ? state.sortDir === "asc"
                            ? "desc"
                            : "asc"
                          : "asc",
                    })
                  }
                >
                  <span>{opt.label}</span>
                  {active ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontWeight: 600,
                        fontSize: 11,
                        color: "var(--blue)",
                      }}
                    >
                      {state.sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
                      <Check size={11} strokeWidth={2.5} color="#0073EA" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="filter-panel__footer">
        <button
          type="button"
          className="btn btn-primary btn-primary--md"
          style={{ width: "100%" }}
          onClick={onApply}
        >
          Apply sort
        </button>
      </div>
    </aside>
  );
}
