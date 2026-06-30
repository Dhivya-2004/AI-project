import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [jobs, latestResume] = await Promise.all([
    prisma.job.findMany({ where: { userId } }),
    prisma.resume.findFirst({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
      select: { atsScore: true },
    }),
  ]);

  const totalApplications = jobs.length;
  const interviews = jobs.filter((j) =>
    ["Technical Interview", "HR Interview", "Offer", "Hired"].includes(j.status)
  ).length;
  const offers = jobs.filter((j) => ["Offer", "Hired"].includes(j.status)).length;
  const rejected = jobs.filter((j) => j.status === "Rejected").length;
  const successRate =
    totalApplications > 0 ? Math.round((interviews / totalApplications) * 100) : 0;

  // Status breakdown
  const statusOrder = [
    "Applied",
    "Screening",
    "Technical Interview",
    "HR Interview",
    "Offer",
    "Hired",
    "Rejected",
  ];
  const statusBreakdown = statusOrder.map((status) => ({
    status,
    count: jobs.filter((j) => j.status === status).length,
  }));

  // Monthly applications (last 6 months)
  const now = new Date();
  const monthlyApplications = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    const monthJobs = jobs.filter(
      (j) => new Date(j.appliedDate) >= date && new Date(j.appliedDate) < nextDate
    );
    return {
      month: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      applications: monthJobs.length,
      interviews: monthJobs.filter((j) =>
        ["Technical Interview", "HR Interview", "Offer", "Hired"].includes(j.status)
      ).length,
    };
  });

  return NextResponse.json({
    totalApplications,
    interviews,
    offers,
    rejected,
    successRate,
    resumeScore: latestResume?.atsScore ?? 0,
    statusBreakdown,
    monthlyApplications,
  });
}
