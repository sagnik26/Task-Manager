import { EmptyState } from "@/shared/ui/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      title="Not found"
      description="The page you're looking for doesn't exist."
      actionLabel="Go to dashboard"
      actionHref="/projects"
    />
  );
}
