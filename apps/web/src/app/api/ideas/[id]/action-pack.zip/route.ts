import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import archiver from "archiver";
import { PassThrough } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sanitize folder/file names to prevent zip-slip and invalid chars */
function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.\./g, "") // prevent path traversal
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

    // Create zip in memory
    const archive = archiver("zip", { zlib: { level: 9 } });
    const passThrough = new PassThrough();
    const chunks: Buffer[] = [];

    passThrough.on("data", (chunk: Buffer) => chunks.push(chunk));

    archive.pipe(passThrough);

    const folderName = sanitizeName(idea.title);

    for (const [filename, content] of Object.entries(actionPackFiles)) {
      if (typeof content === "string") {
        const safeName = sanitizeName(
          filename.replace(/\.[^.]+$/, "")
        );
        const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
        archive.append(content, { name: `${folderName}/${safeName}${ext}` });
      }
    }

    await archive.finalize();

    // Wait for all chunks
    await new Promise<void>((resolve) => passThrough.on("end", resolve));

    const buffer = Buffer.concat(chunks);

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
