import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getJobRecommendations } from "@/lib/mock-ai";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get skills from latest resume
  const resume = await prisma.resume.findFirst({
    where: { userId: session.user.id },
    orderBy: { uploadedAt: "desc" },
    include: { skills: true },
  });

  const skills = resume?.skills.map((s) => s.skillName) || [];
  const matches = await getJobRecommendations(skills.length > 0 ? skills : ["JavaScript", "React"]);

  return NextResponse.json({ matches });
}
