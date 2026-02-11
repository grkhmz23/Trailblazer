import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken || adminToken === "change-me-in-production") {
      return NextResponse.json(
        { error: "ADMIN_TOKEN not configured" },
        { status: 403 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const providedToken = authHeader?.replace("Bearer ", "");

    if (providedToken !== adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve worker path relative to project root
    const workerDir = path.resolve(process.cwd(), "..", "..", "worker");
    const cmd = `cd "${workerDir}" && python3 run_fortnight.py`;

    // Fire and forget — the worker will take time
    execAsync(cmd).catch((err) => {
      console.error("Worker failed:", err);
    });

    return NextResponse.json({
      status: "started",
      message: "Fortnight report generation started in background",
    });
  } catch (error) {
    console.error("Failed to trigger worker:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
