import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = {
  title: "Narrative Hunter — Solana Ecosystem",
  description:
    "AI-powered narrative detection for the Solana ecosystem. Discover emerging trends before they become obvious.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        {/* Background mesh */}
        <div className="bg-mesh" />

        <div className="relative flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

