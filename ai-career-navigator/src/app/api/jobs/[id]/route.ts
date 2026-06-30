import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const job = await prisma.job.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const updated = await prisma.job.update({
    where: { id },
    data: {
      company: body.company ?? job.company,
      position: body.position ?? job.position,
      status: body.status ?? job.status,
      notes: body.notes ?? job.notes,
      salary: body.salary ?? job.salary,
      location: body.location ?? job.location,
      jobUrl: body.jobUrl ?? job.jobUrl,
      priority: body.priority ?? job.priority,
      interviewDate: body.interviewDate ? new Date(body.interviewDate) : job.interviewDate,
    },
  });

  return NextResponse.json({ job: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  await prisma.job.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
