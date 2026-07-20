"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      name: form.name,
      isSignUp: isSignUp.toString(),
      redirect: false,
    });

    if (result?.error) {
      setError(
        result.error === "User already exists"
          ? "An account with this email already exists."
          : result.error === "Invalid credentials"
          ? "Invalid email or password."
          : "Something went wrong. Please try again."
      );
    } else {
      window.location.href = "/dashboard";
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          background:
            "radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "var(--gradient-primary)",
              marginBottom: "16px",
              fontSize: "24px",
            }}
          >
            🚀
          </div>
          <h1
            style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}
            className="gradient-text"
          >
            AI Career Navigator
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {isSignUp
              ? "Create your account to get started"
              : "Welcome back! Sign in to continue"}
          </p>
        </div>

        <div className="card" style={{ borderRadius: "20px" }}>
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "20px",
                color: "#f87171",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isSignUp && (
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px",
                fontSize: "15px",
                marginTop: "8px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <div className="loader">
                  <span /><span /><span />
                </div>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary-light)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </p>

          {!isSignUp && (
            <p style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "var(--text-muted)" }}>
              Demo: use any email + password (min 6 chars)
            </p>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "var(--text-muted)" }}>
          <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
