"use client";

import { useState, useCallback } from "react";

interface ResumeAnalysis {
  atsScore: number;
  extractedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  experience: { years: number; level: string };
  education: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  educationDetails?: Array<{
    degree?: string;
    institution?: string;
    year?: string;
  }>;
  experienceDetails?: Array<{
    role?: string;
    company?: string;
    duration?: string;
    description?: string[];
  }>;
  certifications?: string[];
}

function ATSScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: "140px", height: "140px" }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: 900, color }}>{score}</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>/ 100</div>
        </div>
      </div>
      <div style={{ fontSize: "16px", fontWeight: 700, color, marginTop: "8px" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>ATS Score</div>
    </div>
  );
}

export default function ResumePage() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".docx") && !file.name.endsWith(".pdf")) {
      setError("Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    setFileName(file.name);
    setError("");
    setUploading(true);
    setAnalysis(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const processRes = await fetch("/api/resume/process", { method: "POST", body: formData });
      const result = await processRes.json();
      if (!processRes.ok) throw new Error(result.error || "Processing failed");
      
      setUploading(false);
      setAnalyzing(true);
      // Simulating a brief delay for UI since the single request does everything
      await new Promise(r => setTimeout(r, 500));
      
      setAnalysis(result.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process resume. Please try again.");
      console.error(e);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const isLoading = uploading || analyzing;

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>AI Resume Analyzer</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Upload your resume to get ATS score, skill extraction, and AI-powered improvement suggestions
        </p>
      </div>

      <div className="page-content">
        {/* Upload Zone */}
        <div
          className={`dropzone ${dragOver ? "active" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{ marginBottom: "24px", position: "relative" }}
        >
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div className="loader" style={{ transform: "scale(1.5)" }}>
                <span /><span /><span />
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                  {uploading ? "Uploading & parsing your resume..." : "AI is analyzing your resume..."}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {analyzing ? "Calculating ATS score, extracting skills, generating suggestions" : "Processing file"}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                {fileName ? "📄" : "☁️"}
              </div>
              <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
                {fileName ? fileName : "Drop your resume here"}
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
                Supports PDF, DOCX, and TXT files
              </div>
              <label htmlFor="resume-upload">
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleInputChange}
                  style={{ display: "none" }}
                />
                <button
                  className="btn-primary"
                  onClick={() => document.getElementById("resume-upload")?.click()}
                  style={{ pointerEvents: "none" }}
                >
                  📂 Choose File
                </button>
              </label>
            </>
          )}
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "12px",
              padding: "14px 18px",
              color: "#f87171",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="animate-fade-in">
            {/* Personal Info Row */}
            {analysis.personalInfo && (
              <div className="card" style={{ marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Name</div>
                  <div style={{ fontSize: "18px", fontWeight: 700 }}>{analysis.personalInfo.name || "N/A"}</div>
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Email</div>
                  <div style={{ fontSize: "16px", fontWeight: 500 }}>{analysis.personalInfo.email || "N/A"}</div>
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Phone</div>
                  <div style={{ fontSize: "16px", fontWeight: 500 }}>{analysis.personalInfo.phone || "N/A"}</div>
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Address</div>
                  <div style={{ fontSize: "16px", fontWeight: 500 }}>{analysis.personalInfo.address || "N/A"}</div>
                </div>
              </div>
            )}

            {/* Score + Summary Row */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 40px" }}>
                <ATSScoreGauge score={analysis.atsScore} />
              </div>

              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>📋 Resume Summary</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.7 }}>
                  {analysis.summary || "No summary provided."}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "var(--surface)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Experience</div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{analysis.experience?.years || 0} years</div>
                  </div>
                  <div style={{ background: "var(--surface)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Level</div>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{analysis.experience?.level || "Unknown"}</div>
                  </div>
                  <div style={{ background: "var(--surface)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Education</div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{analysis.education || "Unknown"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>
                  ✅ Detected Skills ({(analysis.extractedSkills || []).length})
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(analysis.extractedSkills || []).map((skill) => (
                    <span key={skill} className="skill-chip skill-chip-success">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>
                  ❌ Missing Skills ({(analysis.missingSkills || []).length})
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Consider adding these in-demand skills
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(analysis.missingSkills || []).map((skill) => (
                    <span key={skill} className="skill-chip skill-chip-missing">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Certifications Row */}
            {analysis.certifications && analysis.certifications.length > 0 && (
              <div className="card" style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>
                  🏆 Certifications & Licenses
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {analysis.certifications.map((cert) => (
                    <span key={cert} style={{ background: "rgba(99,102,241,0.1)", color: "#4f46e5", border: "1px solid rgba(99,102,241,0.2)", padding: "6px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: 500 }}>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience and Education Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
                  💼 Experience History
                </h3>
                {(!analysis.experienceDetails || analysis.experienceDetails.length === 0) ? (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No detailed experience found.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {analysis.experienceDetails.map((exp, i) => (
                      <div key={i} style={{ padding: "12px", background: "var(--surface)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "14px" }}>{exp.role || "Role Not Specified"}</div>
                            <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{exp.company || "Company Not Specified"}</div>
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: "12px" }}>
                            {exp.duration || "Duration Unknown"}
                          </div>
                        </div>
                        {exp.description && exp.description.length > 0 && (
                          <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                            {exp.description.map((desc, j) => (
                              <li key={j}>{desc}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
                  🎓 Education History
                </h3>
                {(!analysis.educationDetails || analysis.educationDetails.length === 0) ? (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No detailed education found.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {analysis.educationDetails.map((edu, i) => (
                      <div key={i} style={{ padding: "12px", background: "var(--surface)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "14px" }}>{edu.degree || "Degree Not Specified"}</div>
                            <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "2px" }}>{edu.institution || "Institution Not Specified"}</div>
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: "12px" }}>
                            {edu.year || "Year Unknown"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Suggestions + Strengths */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
                  💡 AI Improvement Suggestions
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(analysis.suggestions || []).map((suggestion, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "12px",
                        background: "var(--surface)",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "rgba(99,102,241,0.15)",
                          border: "1px solid rgba(99,102,241,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#818cf8",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
                  💪 Strengths
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  {(analysis.strengths || []).map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ color: "#34d399", fontSize: "16px" }}>✓</span>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{s}</span>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>
                  🔧 Areas to Improve
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(analysis.improvements || []).map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ color: "#fbbf24", fontSize: "16px" }}>→</span>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
