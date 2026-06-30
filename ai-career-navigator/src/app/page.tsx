"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const features = [
  {
    icon: "🤖",
    title: "AI Resume Analyzer",
    description: "Upload your resume and get instant ATS score, skill extraction, and personalized improvement suggestions powered by AI.",
    color: "#6366f1",
  },
  {
    icon: "📋",
    title: "Job Application Tracker",
    description: "Manage all your applications with a beautiful Kanban board. Track status, interviews, notes, and deadlines in one place.",
    color: "#8b5cf6",
  },
  {
    icon: "🎯",
    title: "AI Job Matching",
    description: "Get personalized job recommendations based on your skills. See compatibility scores and identify what skills you need to learn.",
    color: "#06b6d4",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    description: "Track your job search performance with detailed analytics. Monitor application rates, interview success, and offer conversions.",
    color: "#10b981",
  },
  {
    icon: "🎤",
    title: "Interview Preparation",
    description: "AI-generated interview questions tailored to your target role and skills. Prepare confidently for every stage.",
    color: "#f59e0b",
  },
  {
    icon: "✉️",
    title: "Cover Letter Generator",
    description: "Generate compelling, personalized cover letters for any job in seconds using your resume data.",
    color: "#ef4444",
  },
];

const stats = [
  { value: "95%", label: "ATS Accuracy" },
  { value: "3x", label: "More Interviews" },
  { value: "10k+", label: "Jobs Matched" },
  { value: "50%", label: "Faster Hiring" },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Navbar */}
      <nav
        className="glass"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 32px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🚀</span>
          <span style={{ fontWeight: 800, fontSize: "18px" }} className="gradient-text">
            AI Career Navigator
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {session ? (
            <Link href="/dashboard">
              <button className="btn-primary">Go to Dashboard →</button>
            </Link>
          ) : (
            <>
              <Link href="/auth/signin">
                <button className="btn-ghost" style={{ color: "var(--text-secondary)" }}>Sign In</button>
              </Link>
              <Link href="/auth/signin">
                <button className="btn-primary">Get Started Free</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section
        className="hero-gradient"
        style={{
          paddingTop: "140px",
          paddingBottom: "100px",
          textAlign: "center",
          padding: "140px 32px 100px",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div
            className="badge badge-primary"
            style={{ marginBottom: "24px", fontSize: "13px", padding: "6px 16px" }}
          >
            ✨ AI-Powered Career Management
          </div>

          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "24px",
              letterSpacing: "-0.02em",
            }}
          >
            Land Your{" "}
            <span className="gradient-text">Dream Job</span>
            <br />
            Faster with AI
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "var(--text-secondary)",
              maxWidth: "560px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Analyze your resume, get ATS scores, track applications, and discover
            perfect job matches — all powered by artificial intelligence.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signin">
              <button
                className="btn-primary animate-pulse-glow"
                style={{ padding: "14px 32px", fontSize: "16px" }}
              >
                🚀 Start for Free
              </button>
            </Link>
            <Link href="#features">
              <button className="btn-secondary" style={{ padding: "14px 32px", fontSize: "16px" }}>
                See Features →
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            justifyContent: "center",
            marginTop: "80px",
            flexWrap: "wrap",
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
                className="gradient-text"
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2
              style={{
                fontSize: "42px",
                fontWeight: 800,
                marginBottom: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              Everything You Need to{" "}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto" }}>
              A complete AI-powered toolkit for modern job seekers
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {features.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: `${feature.color}22`,
                    border: `1px solid ${feature.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginBottom: "20px",
                  }}
                >
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 32px" }}>
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            textAlign: "center",
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "28px",
            padding: "64px 48px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "300px",
              height: "200px",
              background: "radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
              position: "relative",
            }}
          >
            Ready to Accelerate
            <br />
            <span className="gradient-text">Your Career?</span>
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "16px",
              marginBottom: "32px",
              position: "relative",
            }}
          >
            Join thousands of job seekers who improved their hiring success with AI Career Navigator.
          </p>
          <Link href="/auth/signin">
            <button
              className="btn-primary"
              style={{ padding: "14px 40px", fontSize: "16px", position: "relative" }}
            >
              🚀 Get Started for Free
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "14px",
        }}
      >
        <p>© 2024 AI Career Navigator. Built with Next.js, TypeScript & AI.</p>
      </footer>
    </div>
  );
}
