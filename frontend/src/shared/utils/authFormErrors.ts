import { toApiError } from "./apiErrors";

type FieldErrors<K extends string> = Partial<Record<K, string>>;

function pickFieldErrors<K extends string>(
  fields: Record<string, string>,
  allowedKeys: readonly K[],
): FieldErrors<K> {
  const allowed = new Set<string>(allowedKeys);
  const next: FieldErrors<K> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (allowed.has(k)) {
      (next as Record<string, string>)[k] = v;
    }
  }
  return next;
}

export type HandleAuthFormErrorOptions<K extends string> = {
  error: unknown;
  allowedFieldKeys: readonly K[];
  setFieldErrors: (errors: FieldErrors<K>) => void;
  setFormError: (message: string) => void;
  unauthorizedMessage?: string;
  conflictMessage?: string;
  defaultMessage: string;
};

export function handleAuthFormError<K extends string>(
  opts: HandleAuthFormErrorOptions<K>,
): void {
  const apiError = toApiError(opts.error);

  if (apiError.kind === "validation") {
    opts.setFieldErrors(pickFieldErrors(apiError.fields, opts.allowedFieldKeys));
    return;
  }

  if (apiError.kind === "unauthorized") {
    opts.setFormError(opts.unauthorizedMessage ?? "Unauthorized.");
    return;
  }

  if (apiError.kind === "http" && apiError.status === 409) {
    opts.setFormError(opts.conflictMessage ?? apiError.message);
    return;
  }

  opts.setFormError(apiError.message || opts.defaultMessage);
}

