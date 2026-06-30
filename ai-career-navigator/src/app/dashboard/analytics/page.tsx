"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface AnalyticsData {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejected: number;
  successRate: number;
  resumeScore: number;
  statusBreakdown: { status: string; count: number }[];
  monthlyApplications: { month: string; applications: number; interviews: number }[];
}

const STATUS_COLOR: Record<string, string> = {
  Applied: "#6366f1",
  Screening: "#f59e0b",
  "Technical Interview": "#3b82f6",
  "HR Interview": "#8b5cf6",
  Offer: "#10b981",
  Hired: "#059669",
  Rejected: "#ef4444",
};

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#059669"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "13px",
        }}
      >
        {label && <div style={{ fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>{label}</div>}
        {payload.map((entry, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: entry.color }} />
            {entry.name}: <span style={{ fontWeight: 600, color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "8px" }} />
          <div className="skeleton" style={{ height: "16px", width: "300px" }} />
        </div>
        <div className="page-content">
          <div className="stats-grid" style={{ marginBottom: "24px" }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="card skeleton" style={{ height: "100px" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statsCards = [
    { label: "Total Applications", value: data.totalApplications, icon: "📝", color: "#6366f1" },
    { label: "Interviews", value: data.interviews, icon: "🎤", color: "#f59e0b" },
    { label: "Offers", value: data.offers, icon: "🎉", color: "#10b981" },
    { label: "Rejected", value: data.rejected, icon: "❌", color: "#ef4444" },
    { label: "Success Rate", value: `${data.successRate}%`, icon: "📈", color: "#06b6d4" },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>Analytics Dashboard</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Track your job search performance and identify patterns
        </p>
      </div>

      <div className="page-content">
        {/* KPI Cards */}
        <div className="stats-grid" style={{ marginBottom: "24px", gridTemplateColumns: "repeat(5, 1fr)" }}>
          {statsCards.map(card => (
            <div key={card.label} className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{card.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: card.color, lineHeight: 1, marginBottom: "6px" }}>
                {card.value}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          {/* Monthly Activity */}
          <div className="card">
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>
              📅 Monthly Activity
            </h3>
            {data.monthlyApplications.length === 0 ? (
              <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                No data yet. Start adding applications!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.monthlyApplications} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{v}</span>} />
                  <Bar dataKey="applications" name="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="interviews" name="Interviews" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status Breakdown Pie */}
          <div className="card">
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>
              🗂️ Application Status Breakdown
            </h3>
            {data.statusBreakdown.filter(s => s.count > 0).length === 0 ? (
              <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                No applications yet
              </div>
            ) : (
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.statusBreakdown.filter(s => s.count > 0)}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {data.statusBreakdown.filter(s => s.count > 0).map((entry, i) => (
                        <Cell key={entry.status} fill={STATUS_COLOR[entry.status] || CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px" }}>
                            <span style={{ fontWeight: 600 }}>{payload[0].name}: </span>
                            <span style={{ color: "var(--primary-light)" }}>{payload[0].value}</span>
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {data.statusBreakdown.filter(s => s.count > 0).map(s => (
                    <div key={s.status} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: STATUS_COLOR[s.status], flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", flex: 1 }}>{s.status}</span>
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>🔻 Application Funnel</h3>
          <div style={{ display: "flex", gap: "0", alignItems: "stretch" }}>
            {[
              { label: "Applied", value: data.totalApplications, color: "#6366f1" },
              { label: "Screened", value: data.statusBreakdown.find(s => s.status === "Screening")?.count || 0, color: "#f59e0b" },
              { label: "Interviewed", value: data.interviews, color: "#3b82f6" },
              { label: "Offered", value: data.offers, color: "#10b981" },
              { label: "Hired", value: data.statusBreakdown.find(s => s.status === "Hired")?.count || 0, color: "#059669" },
            ].map((stage, i, arr) => {
              const width = data.totalApplications === 0 ? 20 : Math.max(20, (stage.value / data.totalApplications) * 100);
              return (
                <div key={stage.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "48px",
                      background: `${stage.color}22`,
                      border: `1px solid ${stage.color}44`,
                      borderRadius: i === 0 ? "10px 0 0 10px" : i === arr.length - 1 ? "0 10px 10px 0" : "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s",
                    }}
                  >
                    <span style={{ fontSize: "20px", fontWeight: 800, color: stage.color }}>{stage.value}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resume Score */}
        {data.resumeScore > 0 && (
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.08) 100%)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>📄 Resume Performance</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: `conic-gradient(#818cf8 ${data.resumeScore * 3.6}deg, var(--border) 0)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "var(--surface-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#818cf8",
                  }}
                >
                  {data.resumeScore}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>
                  ATS Score: {data.resumeScore >= 80 ? "Excellent 🎉" : data.resumeScore >= 60 ? "Good 📈" : "Needs Work 💡"}
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "400px" }}>
                  {data.resumeScore >= 80
                    ? "Your resume is well-optimized for ATS systems. Keep it updated as you apply to new roles."
                    : data.resumeScore >= 60
                    ? "Good resume! Consider adding more keywords from job descriptions to improve your score."
                    : "Upload an updated resume with more relevant keywords and achievements to improve your ATS score."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
