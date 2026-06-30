import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "100");

  const jobs = await prisma.job.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { company, position, status, notes, salary, location, jobUrl, priority } = body;

  if (!company || !position) {
    return NextResponse.json({ error: "Company and position are required" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      userId: session.user.id,
      company,
      position,
      status: status || "Applied",
      notes,
      salary,
      location,
      jobUrl,
      priority: priority || "Medium",
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
