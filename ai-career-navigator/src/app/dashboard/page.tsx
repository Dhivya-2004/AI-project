"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejected: number;
  successRate: number;
  resumeScore: number;
}

interface RecentJob {
  id: string;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
}

const STATUS_EMOJI: Record<string, string> = {
  Applied: "📝",
  Screening: "🔍",
  "Technical Interview": "💻",
  "HR Interview": "🤝",
  Offer: "🎉",
  Hired: "✅",
  Rejected: "❌",
};

const STATUS_COLOR: Record<string, string> = {
  Applied: "#6366f1",
  Screening: "#f59e0b",
  "Technical Interview": "#3b82f6",
  "HR Interview": "#8b5cf6",
  Offer: "#10b981",
  Hired: "#059669",
  Rejected: "#ef4444",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [analyticsRes, jobsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/jobs?limit=5"),
      ]);
      if (analyticsRes.ok) setStats(await analyticsRes.json());
      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setRecentJobs(data.jobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const statCards = [
    { label: "Total Applications", value: stats?.totalApplications ?? 0, icon: "📝", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    { label: "Interviews", value: stats?.interviews ?? 0, icon: "🎤", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Offers Received", value: stats?.offers ?? 0, icon: "🎉", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Success Rate", value: `${stats?.successRate ?? 0}%`, icon: "📈", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  ];

  const quickActions = [
    { href: "/dashboard/resume", icon: "📄", label: "Analyze Resume", desc: "Upload & get ATS score" },
    { href: "/dashboard/jobs", icon: "➕", label: "Add Application", desc: "Track a new job" },
    { href: "/dashboard/matching", icon: "🎯", label: "Find Matches", desc: "AI job recommendations" },
    { href: "/dashboard/interview-prep", icon: "🎤", label: "Prep Interview", desc: "Practice with AI" },
  ];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {firstName}! 👋
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
              Here&apos;s your career progress overview
            </p>
          </div>
          <Link href="/dashboard/resume">
            <button className="btn-primary">
              ✨ Analyze Resume
            </button>
          </Link>
        </div>
      </div>

      <div className="page-content">
        {/* Stats grid */}
        <div className="stats-grid" style={{ marginBottom: "24px" }}>
          {statCards.map((card) => (
            <div key={card.label} className="card card-glow" style={{ padding: "20px" }}>
              {loading ? (
                <div>
                  <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "10px", marginBottom: "12px" }} />
                  <div className="skeleton" style={{ width: "60px", height: "28px", borderRadius: "6px", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ width: "100px", height: "14px", borderRadius: "4px" }} />
                </div>
              ) : (
                <>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: card.bg,
                      border: `1px solid ${card.color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      marginBottom: "16px",
                    }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: card.color, lineHeight: 1, marginBottom: "6px" }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{card.label}</div>
                </>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Quick Actions */}
          <div className="card">
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Quick Actions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "14px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.5)";
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                    }}
                  >
                    <div style={{ fontSize: "22px", marginBottom: "8px" }}>{action.icon}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>{action.label}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{action.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Recent Applications</h2>
              <Link href="/dashboard/jobs">
                <button className="btn-ghost" style={{ fontSize: "12px", padding: "4px 10px" }}>View all →</button>
              </Link>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "8px" }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: "120px", height: "13px", borderRadius: "4px", marginBottom: "6px" }} />
                      <div className="skeleton" style={{ width: "80px", height: "11px", borderRadius: "4px" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
                <p style={{ fontSize: "14px" }}>No applications yet</p>
                <Link href="/dashboard/jobs">
                  <button className="btn-primary" style={{ marginTop: "12px", padding: "8px 20px", fontSize: "13px" }}>
                    Add First Job
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px",
                      background: "var(--surface)",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: `${STATUS_COLOR[job.status]}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      {STATUS_EMOJI[job.status] || "📝"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {job.position}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{job.company}</div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: `${STATUS_COLOR[job.status]}22`,
                        color: STATUS_COLOR[job.status],
                        border: `1px solid ${STATUS_COLOR[job.status]}44`,
                        fontSize: "11px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resume Score Banner */}
        {!loading && stats && stats.resumeScore > 0 && (
          <div
            className="card"
            style={{
              marginTop: "24px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Latest Resume ATS Score
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "36px", fontWeight: 900, color: "#818cf8" }}>
                    {stats.resumeScore}%
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>
                      {stats.resumeScore >= 80 ? "Excellent! 🎉" : stats.resumeScore >= 60 ? "Good, room to improve 📈" : "Needs improvement 💡"}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Upload a new resume to improve your score
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/resume">
                <button className="btn-primary" style={{ padding: "10px 20px" }}>
                  📄 Improve Resume
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
