import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
          <span className="text-2xl font-bold text-primary">404</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Page not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          aria-label="Return to homepage"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
