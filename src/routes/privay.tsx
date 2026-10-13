import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy typo URL — permanently redirect to /privacy */
export const Route = createFileRoute("/privay")({
  beforeLoad: () => {
    throw redirect({ to: "/privacy", replace: true });
  },
});
