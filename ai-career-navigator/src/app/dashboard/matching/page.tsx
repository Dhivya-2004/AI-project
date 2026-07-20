"use client";

import { useState, useEffect } from "react";

interface JobMatch {
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  salary: string;
  description: string;
}

function MatchScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ flex: 1, height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: "4px",
            transition: "width 0.8s ease",
          }}
        />
      </div>
      <span style={{ fontSize: "14px", fontWeight: 700, color, minWidth: "36px" }}>{score}%</span>
    </div>
  );
}

export default function MatchingPage() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "salary">("score");

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matching");
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkResume = async () => {
    const res = await fetch("/api/resume/latest");
    if (res.ok) {
      const data = await res.json();
      if (data.resume) {
        setHasResume(true);
        fetchMatches();
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkResume();
  }, []);

  const sorted = [...matches].sort((a, b) =>
    sortBy === "score" ? b.matchScore - a.matchScore : 0
  );

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>AI Job Matching</h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Personalized job recommendations based on your resume skills
            </p>
          </div>
          {hasResume && (
            <div style={{ display: "flex", gap: "12px" }}>
              <select
                className="input"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as "score" | "salary")}
                style={{ width: "auto" }}
              >
                <option value="score">Sort: Best Match</option>
                <option value="salary">Sort: Salary</option>
              </select>
              <button className="btn-primary" onClick={fetchMatches} disabled={loading}>
                {loading ? "Refreshing..." : "🔄 Refresh"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="page-content">
        {!hasResume ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 32px",
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎯</div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>Upload Your Resume First</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
              Our AI analyzes your skills from your resume to find the best matching jobs for you.
            </p>
            <a href="/dashboard/resume">
              <button className="btn-primary" style={{ padding: "12px 28px" }}>
                📄 Analyze Resume
              </button>
            </a>
          </div>
        ) : loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card" style={{ padding: "24px" }}>
                <div className="skeleton" style={{ height: "20px", width: "70%", marginBottom: "12px" }} />
                <div className="skeleton" style={{ height: "14px", width: "50%", marginBottom: "20px" }} />
                <div className="skeleton" style={{ height: "8px", marginBottom: "16px" }} />
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[1, 2, 3].map(j => (
                    <div key={j} className="skeleton" style={{ height: "24px", width: "60px", borderRadius: "20px" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Job list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {sorted.map((job, i) => (
                <div
                  key={i}
                  className="card card-glow"
                  style={{
                    cursor: "pointer",
                    border: selectedJob === job ? "1px solid rgba(99,102,241,0.6)" : "1px solid var(--border)",
                    background: selectedJob === job ? "rgba(99,102,241,0.05)" : "var(--surface-elevated)",
                  }}
                  onClick={() => setSelectedJob(selectedJob === job ? null : job)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{job.title}</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        🏢 {job.company} · 📍 {job.location}
                      </p>
                    </div>
                    <div
                      style={{
                        background: job.matchScore >= 80 ? "rgba(16,185,129,0.1)" : job.matchScore >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                        color: job.matchScore >= 80 ? "#34d399" : job.matchScore >= 60 ? "#fbbf24" : "#f87171",
                        border: `1px solid ${job.matchScore >= 80 ? "rgba(16,185,129,0.3)" : job.matchScore >= 60 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`,
                        borderRadius: "20px",
                        padding: "4px 12px",
                        fontSize: "13px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {job.matchScore}% match
                    </div>
                  </div>

                  <MatchScoreBar score={job.matchScore} />

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                    {job.matchedSkills.slice(0, 4).map(skill => (
                      <span key={skill} className="skill-chip skill-chip-success" style={{ fontSize: "11px" }}>{skill}</span>
                    ))}
                    {job.matchedSkills.length > 4 && (
                      <span className="badge badge-gray" style={{ fontSize: "11px" }}>+{job.matchedSkills.length - 4}</span>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                    <span style={{ fontSize: "13px", color: "#34d399", fontWeight: 600 }}>💰 {job.salary}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {job.missingSkills.length} skills to learn
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Job detail */}
            <div style={{ position: "sticky", top: "24px", height: "fit-content" }}>
              {selectedJob ? (
                <div className="card animate-fade-in">
                  <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "4px" }}>{selectedJob.title}</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
                    {selectedJob.company} · {selectedJob.location}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ background: "var(--surface)", borderRadius: "12px", padding: "14px" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Match Score</div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#818cf8" }}>{selectedJob.matchScore}%</div>
                    </div>
                    <div style={{ background: "var(--surface)", borderRadius: "12px", padding: "14px" }}>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Salary</div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#34d399" }}>{selectedJob.salary}</div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>About the Role</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                    {selectedJob.description}
                  </p>

                  <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>✅ Your Matching Skills</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                    {selectedJob.matchedSkills.map(s => (
                      <span key={s} className="skill-chip skill-chip-success" style={{ fontSize: "12px" }}>{s}</span>
                    ))}
                  </div>

                  <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>❌ Skills to Learn</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                    {selectedJob.missingSkills.map(s => (
                      <span key={s} className="skill-chip skill-chip-missing" style={{ fontSize: "12px" }}>{s}</span>
                    ))}
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={async () => {
                      await fetch("/api/jobs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          company: selectedJob.company,
                          position: selectedJob.title,
                          location: selectedJob.location,
                          salary: selectedJob.salary,
                          status: "Applied",
                        }),
                      });
                      alert("Added to job tracker! 🎉");
                    }}
                  >
                    📋 Add to Job Tracker
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 32px",
                    border: "2px dashed var(--border)",
                    borderRadius: "20px",
                    color: "var(--text-muted)",
                  }}
                >
                  <div style={{ fontSize: "40px", marginBottom: "16px" }}>👆</div>
                  <p style={{ fontSize: "14px" }}>Click a job to see details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
