"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/dashboard/resume", icon: "📄", label: "Resume Analyzer" },
  { href: "/dashboard/jobs", icon: "📋", label: "Job Tracker" },
  { href: "/dashboard/matching", icon: "🎯", label: "AI Job Matching" },
  { href: "/dashboard/analytics", icon: "📊", label: "Analytics" },
];

const bonusItems = [
  { href: "/dashboard/interview-prep", icon: "🎤", label: "Interview Prep" },
  { href: "/dashboard/cover-letter", icon: "✉️", label: "Cover Letter" },
  { href: "/dashboard/roadmap", icon: "🗺️", label: "Skill Roadmap" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="loader" style={{ justifyContent: "center", marginBottom: "16px" }}>
            <span /><span /><span />
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const initials = session.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ zIndex: 50 }}>
        {/* Logo */}
        <div style={{ padding: "24px 16px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0" }}>
            <span style={{ fontSize: "22px" }}>🚀</span>
            <span style={{ fontWeight: 800, fontSize: "15px", lineHeight: 1.2 }} className="gradient-text">
              AI Career<br />Navigator
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 0", flex: 1 }}>
          <div style={{ padding: "0 8px 8px", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: "16px" }}>
            Main
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${pathname === item.href ? "active" : ""}`}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div style={{ padding: "16px 8px 8px", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: "16px" }}>
            AI Extras
          </div>
          {bonusItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${pathname === item.href ? "active" : ""}`}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User profile */}
        <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px",
              borderRadius: "12px",
              background: "var(--surface-hover)",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user?.name || "User"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn-ghost"
            style={{ width: "100%", justifyContent: "center", fontSize: "13px", color: "var(--danger)" }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content" style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
