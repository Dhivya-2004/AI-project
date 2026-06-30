"use client";

import { useState } from "react";

interface Phase {
  phase: string;
  skills: string[];
  duration: string;
  resources: string[];
}

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Phase[]>([]);

  const handleGenerate = async () => {
    if (!targetRole) return;
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          currentSkills: currentSkills.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const PHASE_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981"];

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>🗺️ Skill Roadmap Generator</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Get a personalized learning roadmap to reach your target role
        </p>
      </div>

      <div className="page-content">
        {/* Input */}
        <div className="card" style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Configure Your Roadmap</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label className="label">Target Role *</label>
              <input
                className="input"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g., Machine Learning Engineer"
              />
            </div>
            <div>
              <label className="label">Current Skills (comma-separated)</label>
              <input
                className="input"
                value={currentSkills}
                onChange={e => setCurrentSkills(e.target.value)}
                placeholder="Python, SQL, Statistics..."
              />
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading || !targetRole}
            style={{ opacity: !targetRole ? 0.5 : 1 }}
          >
            {loading ? <div className="loader"><span /><span /><span /></div> : "🗺️ Generate Roadmap"}
          </button>
        </div>

        {/* Roadmap */}
        {roadmap.length > 0 && (
          <div className="animate-fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800 }}>
                Your Roadmap to become a {targetRole}
              </h2>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "4px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px" }}>
                ~{roadmap.length * 2} months
              </div>
            </div>

            {/* Timeline */}
            <div style={{ position: "relative" }}>
              {/* Vertical line */}
              <div
                style={{
                  position: "absolute",
                  left: "27px",
                  top: "28px",
                  bottom: "28px",
                  width: "2px",
                  background: "linear-gradient(to bottom, var(--primary), transparent)",
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {roadmap.map((phase, i) => (
                  <div key={i} style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                    {/* Circle */}
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: `${PHASE_COLORS[i]}22`,
                        border: `2px solid ${PHASE_COLORS[i]}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: 800,
                        color: PHASE_COLORS[i],
                        flexShrink: 0,
                        zIndex: 1,
                        position: "relative",
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Content */}
                    <div
                      className="card card-glow"
                      style={{ flex: 1, borderLeft: `3px solid ${PHASE_COLORS[i]}` }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                        <h3 style={{ fontSize: "17px", fontWeight: 700 }}>{phase.phase}</h3>
                        <span
                          style={{
                            fontSize: "12px",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            background: `${PHASE_COLORS[i]}15`,
                            color: PHASE_COLORS[i],
                            border: `1px solid ${PHASE_COLORS[i]}33`,
                            fontWeight: 600,
                          }}
                        >
                          ⏱ {phase.duration}
                        </span>
                      </div>

                      <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>
                        Skills to Learn
                      </h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                        {phase.skills.map(skill => (
                          <span key={skill} className="skill-chip">{skill}</span>
                        ))}
                      </div>

                      <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>
                        📚 Resources
                      </h4>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {phase.resources.map(resource => (
                          <span
                            key={resource}
                            className="badge badge-gray"
                          >
                            🔗 {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && roadmap.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 32px",
              border: "2px dashed var(--border)",
              borderRadius: "20px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🗺️</div>
            <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Chart Your Path to Success</p>
            <p style={{ fontSize: "14px" }}>Enter your target role and current skills to generate a personalized learning roadmap</p>
          </div>
        )}
      </div>
    </div>
  );
}
