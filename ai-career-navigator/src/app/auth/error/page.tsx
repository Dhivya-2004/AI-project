"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div style={{ textAlign: "center", marginBottom: "40px" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "var(--danger, #ef4444)",
          marginBottom: "16px",
          fontSize: "24px",
          color: "white"
        }}
      >
        ⚠️
      </div>
      <h1
        style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}
      >
        Authentication Error
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
        {error ? `Error details: ${error}` : "An error occurred during authentication."}
      </p>
      
      <Link href="/auth/signin" className="btn-primary" style={{ textDecoration: "none", padding: "10px 20px" }}>
        Back to Sign In
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "40px 20px" }}>
        <Suspense fallback={<div>Loading error details...</div>}>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}
