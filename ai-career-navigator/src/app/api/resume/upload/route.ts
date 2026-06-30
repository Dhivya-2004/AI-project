import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    let resumeText = "";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".txt")) {
      resumeText = buffer.toString("utf-8");
    } else if (fileName.endsWith(".pdf")) {
      try {
        // Dynamic import to avoid SSR issues
        const pdfParse = (await import("pdf-parse")).default;
        const pdfData = await pdfParse(buffer);
        resumeText = pdfData.text;
      } catch {
        resumeText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ");
      }
    } else if (fileName.endsWith(".docx")) {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        resumeText = result.value;
      } catch {
        resumeText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ");
      }
    } else {
      resumeText = buffer.toString("utf-8");
    }

    if (!resumeText.trim()) {
      resumeText = "Resume content could not be fully extracted. Please ensure the file is not encrypted or corrupted.";
    }

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        resumeText: resumeText.slice(0, 50000), // Limit text size
      },
    });

    return NextResponse.json({ resumeId: resume.id, fileName: file.name });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
