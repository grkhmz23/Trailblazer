import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function Card({ className, children, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/40 bg-card/70 backdrop-blur-sm p-5 transition-all duration-300",
        glow && "glow-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
