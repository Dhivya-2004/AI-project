"use client";

import { useState } from "react";

export default function CoverLetterPage() {
  const [form, setForm] = useState({
    name: "",
    position: "",
    company: "",
    skills: "",
    experience: "",
  });
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!form.name || !form.position || !form.company) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLetter(data.coverLetter);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const required = form.name && form.position && form.company;

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>✉️ Cover Letter Generator</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Generate a personalized, professional cover letter in seconds with AI
        </p>
      </div>

      <div className="page-content">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Input Form */}
          <div className="card">
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Your Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="label">Your Full Name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="label">Target Position *</label>
                <input
                  className="input"
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  placeholder="Senior Software Engineer"
                />
              </div>
              <div>
                <label className="label">Company Name *</label>
                <input
                  className="input"
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  placeholder="Google"
                />
              </div>
              <div>
                <label className="label">Key Skills (comma-separated)</label>
                <input
                  className="input"
                  value={form.skills}
                  onChange={e => setForm({ ...form, skills: e.target.value })}
                  placeholder="React, TypeScript, Node.js, AWS..."
                />
              </div>
              <div>
                <label className="label">Brief Experience Summary</label>
                <textarea
                  className="input"
                  value={form.experience}
                  onChange={e => setForm({ ...form, experience: e.target.value })}
                  placeholder="I have 5 years of experience building scalable web applications..."
                  rows={3}
                />
              </div>

              <button
                className="btn-primary"
                onClick={handleGenerate}
                disabled={loading || !required}
                style={{ opacity: !required ? 0.5 : 1, justifyContent: "center" }}
              >
                {loading ? (
                  <>
                    <div className="loader"><span /><span /><span /></div>
                    <span style={{ marginLeft: "8px" }}>Generating...</span>
                  </>
                ) : (
                  "✨ Generate Cover Letter"
                )}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Generated Cover Letter</h3>
              {letter && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleCopy}
                    className="btn-secondary"
                    style={{ padding: "6px 14px", fontSize: "13px" }}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([letter], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `cover-letter-${form.company.toLowerCase()}.txt`;
                      a.click();
                    }}
                    className="btn-secondary"
                    style={{ padding: "6px 14px", fontSize: "13px" }}
                  >
                    ⬇️ Download
                  </button>
                </div>
              )}
            </div>

            {letter ? (
              <div
                style={{
                  flex: 1,
                  background: "var(--surface)",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid var(--border)",
                  fontSize: "13px",
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                  whiteSpace: "pre-wrap",
                  overflowY: "auto",
                  maxHeight: "520px",
                }}
                className="animate-fade-in"
              >
                {letter}
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  gap: "12px",
                  padding: "40px",
                  border: "2px dashed var(--border)",
                  borderRadius: "12px",
                }}
              >
                <div style={{ fontSize: "48px" }}>✉️</div>
                <p style={{ fontSize: "14px", textAlign: "center" }}>
                  Fill in the form and click Generate to create your personalized cover letter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
