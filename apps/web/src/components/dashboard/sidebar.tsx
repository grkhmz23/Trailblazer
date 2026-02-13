"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Search,
  BookOpen,
  Zap,
  Lightbulb,
  Activity,
  GitBranch,
  Twitter,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Zap },
  { href: "/ideas", label: "Build Ideas", icon: Lightbulb },
  { href: "/reports", label: "All Reports", icon: FileText },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
];

const dataSources = [
  { label: "Helius Onchain", icon: Activity, color: "bg-emerald-400" },
  { label: "GitHub Dev", icon: GitBranch, color: "bg-sky-400" },
  { label: "Twitter / X KOLs", icon: Twitter, color: "bg-violet-400" },
  { label: "RSS Feeds", icon: Globe, color: "bg-amber-400" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Brand */}
      <div>
        <Link href="/" className="flex items-center gap-3 px-2 mb-10">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            <img src="/logo.png" alt="Trailblazer" className="h-9 w-9 rounded-lg object-contain" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background animate-glow-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight leading-none">
              Trailblazer
            </div>
            <div className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">
              Solana
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-200",
                  isActive
                    ? "bg-white/[0.04] text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className={cn("font-medium", isActive && "text-foreground")}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto h-1 w-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Data sources + footer */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border/20 bg-white/[0.02] p-3 space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Live Data Sources
          </div>
          {dataSources.map((ds) => (
            <div
              key={ds.label}
              className="flex items-center gap-2.5 text-[11px] text-muted-foreground"
            >
              <div className={cn("h-1.5 w-1.5 rounded-full", ds.color)} />
              <ds.icon className="h-3 w-3 opacity-40" />
              <span>{ds.label}</span>
            </div>
          ))}
        </div>
        <div className="px-1 pb-2 text-[10px] text-muted-foreground/40 leading-relaxed">
          AI-powered narrative detection
          <br />
          Refreshed fortnightly
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg glass lg:hidden"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-56 border-r border-border/20 bg-background/90 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full px-4 py-6 overflow-y-auto">
          {navContent}
        </div>
      </aside>
    </>
  );
}
