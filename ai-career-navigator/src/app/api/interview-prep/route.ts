import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateInterviewQuestions } from "@/lib/mock-ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { position, skills } = await req.json();
  if (!position) {
    return NextResponse.json({ error: "Position is required" }, { status: 400 });
  }

  const questions = await generateInterviewQuestions(position, skills || []);
  return NextResponse.json({ questions });
}
