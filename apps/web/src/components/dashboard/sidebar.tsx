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
  Activity,
  GitBranch,
  Twitter,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Latest Report", icon: Zap, desc: "Current fortnight" },
  { href: "/reports", label: "All Reports", icon: FileText, desc: "Historical data" },
  { href: "/explore", label: "Explore", icon: Search, desc: "Search entities" },
  { href: "/methodology", label: "Methodology", icon: BookOpen, desc: "How it works" },
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
        <Link href="/" className="flex items-center gap-3 px-3 mb-10">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
            <Zap className="h-4 w-4 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background animate-glow-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight leading-none">
              Narrative Hunter
            </div>
            <div className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-0.5">
              Solana Ecosystem
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="space-y-1 px-1">
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
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive && "drop-shadow-[0_0_4px_hsla(265,90%,62%,0.5)]")} />
                <div className="flex flex-col">
                  <span className={cn("font-medium leading-none", isActive && "text-primary")}>{item.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{item.desc}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Data sources + footer */}
      <div className="space-y-4 px-1">
        <div className="rounded-xl border border-border/30 bg-card/40 p-3 space-y-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Live Data Sources
          </div>
          {dataSources.map((ds) => (
            <div
              key={ds.label}
              className="flex items-center gap-2.5 text-[11px] text-muted-foreground"
            >
              <div className={cn("h-1.5 w-1.5 rounded-full", ds.color)} />
              <ds.icon className="h-3 w-3 opacity-50" />
              <span>{ds.label}</span>
            </div>
          ))}
        </div>
        <div className="px-2 pb-2 text-[10px] text-muted-foreground/60 leading-relaxed">
          AI-powered narrative detection · Refreshed fortnightly
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl glass lg:hidden"
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
          "fixed left-0 top-0 z-40 h-screen w-60 border-r border-border/30 bg-background/80 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:translate-x-0",
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

