import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeResume } from "@/lib/mock-ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId } = await req.json();
  if (!resumeId) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId: session.user.id },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  try {
    const analysis = await analyzeResume(resume.resumeText);

    // Save to DB
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        atsScore: analysis.atsScore,
        suggestions: JSON.stringify(analysis.suggestions),
        parsedData: JSON.stringify({
          experience: analysis.experience,
          education: analysis.education,
          summary: analysis.summary,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          email: analysis.email,
          phone: analysis.phone,
        }),
      },
    });

    // Save skills
    await prisma.skill.deleteMany({ where: { resumeId } });
    await prisma.skill.createMany({
      data: analysis.extractedSkills.map((skill) => ({
        resumeId,
        skillName: skill,
        category: "Technical",
      })),
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
