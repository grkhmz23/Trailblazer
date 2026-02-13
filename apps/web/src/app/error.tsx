"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Trailblazer] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-red-500/10">
          <span className="text-2xl text-red-400" aria-hidden="true">!</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
            aria-label="Try again"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-lg border border-border/30 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go to homepage"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
