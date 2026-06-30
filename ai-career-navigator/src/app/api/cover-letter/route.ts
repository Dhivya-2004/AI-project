import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateCoverLetter } from "@/lib/mock-ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, position, company, skills, experience } = await req.json();
  if (!name || !position || !company) {
    return NextResponse.json({ error: "Name, position, and company are required" }, { status: 400 });
  }

  const coverLetter = await generateCoverLetter(name, position, company, skills || [], experience || "");
  return NextResponse.json({ coverLetter });
}
