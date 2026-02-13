import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import archiver from "archiver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: { narrative: true },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const actionPackFiles = idea.actionPackFilesJson as Record<string, string>;

    if (
      !actionPackFiles ||
      typeof actionPackFiles !== "object" ||
      Object.keys(actionPackFiles).length === 0
    ) {
      return NextResponse.json(
        { error: "No action pack files available" },
        { status: 404 }
      );
    }

    const folderName = sanitizeName(idea.title);

    // Collect zip into buffer using a Promise
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const archive = archiver("zip", { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on("data", (chunk: Buffer) => chunks.push(chunk));
      archive.on("end", () => resolve(Buffer.concat(chunks)));
      archive.on("error", reject);

      for (const [filename, content] of Object.entries(actionPackFiles)) {
        if (typeof content === "string") {
          const safeName = sanitizeName(filename.replace(/\.[^.]+$/, ""));
          const ext = filename.includes(".")
            ? filename.slice(filename.lastIndexOf("."))
            : "";
          archive.append(content, { name: `${folderName}/${safeName}${ext}` });
        }
      }

      archive.finalize();
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${folderName}-action-pack.zip"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to generate action pack zip:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
