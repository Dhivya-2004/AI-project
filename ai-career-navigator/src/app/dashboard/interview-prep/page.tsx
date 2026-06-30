"use client";

import { useState } from "react";

interface Question {
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tip: string;
}

const DIFFICULTY_COLOR = {
  Easy: { bg: "rgba(16,185,129,0.1)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  Medium: { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  Hard: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
};

export default function InterviewPrepPage() {
  const [position, setPosition] = useState("");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

  const handleGenerate = async () => {
    if (!position) return;
    setLoading(true);
    setQuestions([]);
    try {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position,
          skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "All" ? questions : questions.filter(q => q.difficulty === filter);

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>🎤 AI Interview Prep</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Generate tailored interview questions and expert tips for your target role
        </p>
      </div>

      <div className="page-content">
        {/* Input Card */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Configure Your Prep Session</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label className="label">Target Position *</label>
              <input
                className="input"
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <label className="label">Your Skills (comma-separated)</label>
              <input
                className="input"
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="React, Node.js, TypeScript, Python..."
              />
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={loading || !position}
            style={{ opacity: !position ? 0.5 : 1 }}
          >
            {loading ? (
              <div className="loader">
                <span /><span /><span />
              </div>
            ) : (
              "🤖 Generate Questions"
            )}
          </button>
        </div>

        {/* Questions */}
        {questions.length > 0 && (
          <div className="animate-fade-in">
            {/* Filter */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {(["All", "Easy", "Medium", "Hard"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "1px solid",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    ...(filter === f
                      ? { background: "var(--primary)", color: "white", borderColor: "var(--primary)" }
                      : { background: "transparent", color: "var(--text-secondary)", borderColor: "var(--border)" }),
                  }}
                >
                  {f} {f !== "All" && `(${questions.filter(q => q.difficulty === f).length})`}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((q, i) => {
                const isOpen = expandedIndex === i;
                const diff = DIFFICULTY_COLOR[q.difficulty];
                return (
                  <div
                    key={i}
                    className="card"
                    style={{ padding: "0", overflow: "hidden", cursor: "pointer" }}
                    onClick={() => setExpandedIndex(isOpen ? null : i)}
                  >
                    <div style={{ padding: "18px 20px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "rgba(99,102,241,0.1)",
                          border: "1px solid rgba(99,102,241,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#818cf8",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "2px 10px",
                              borderRadius: "20px",
                              background: diff.bg,
                              color: diff.color,
                              border: `1px solid ${diff.border}`,
                            }}
                          >
                            {q.difficulty}
                          </span>
                          <span className="badge badge-gray" style={{ fontSize: "11px" }}>{q.category}</span>
                        </div>
                        <p style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.5 }}>{q.question}</p>
                      </div>
                      <span style={{ color: "var(--text-muted)", fontSize: "18px", flexShrink: 0, marginTop: "4px" }}>
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>

                    {isOpen && (
                      <div
                        style={{
                          borderTop: "1px solid var(--border)",
                          padding: "16px 20px 18px",
                          background: "rgba(99,102,241,0.04)",
                        }}
                        className="animate-fade-in"
                      >
                        <div style={{ display: "flex", gap: "10px" }}>
                          <span style={{ fontSize: "18px" }}>💡</span>
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#818cf8", marginBottom: "6px" }}>
                              EXPERT TIP
                            </div>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                              {q.tip}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 32px",
              border: "2px dashed var(--border)",
              borderRadius: "20px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎤</div>
            <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Ready to Prepare?</p>
            <p style={{ fontSize: "14px" }}>Enter your target position above and click Generate Questions</p>
          </div>
        )}
      </div>
    </div>
  );
}
