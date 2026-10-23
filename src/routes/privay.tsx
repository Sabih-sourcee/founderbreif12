import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/privay")({
  beforeLoad: () => {
    throw redirect({ to: "/privacy" });
  },
});
