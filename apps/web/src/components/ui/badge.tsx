import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "secondary" | "info" | "purple";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary border-primary/15",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/15",
  destructive: "bg-red-500/10 text-red-400 border-red-500/15",
  secondary: "bg-zinc-500/10 text-zinc-400 border-zinc-500/15",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/15",
  purple: "bg-violet-500/10 text-violet-400 border-violet-500/15",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
