import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSkillRoadmap } from "@/lib/mock-ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetRole, currentSkills } = await req.json();
  if (!targetRole) {
    return NextResponse.json({ error: "Target role is required" }, { status: 400 });
  }

  const roadmap = await generateSkillRoadmap(currentSkills || [], targetRole);
  return NextResponse.json({ roadmap });
}
