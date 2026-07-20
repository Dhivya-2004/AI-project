"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An unexpected error occurred during authentication.";
  if (error === "Configuration") {
    errorMessage = "There is a problem with the server configuration.";
  } else if (error === "AccessDenied") {
    errorMessage = "You do not have permission to sign in.";
  } else if (error === "Verification") {
    errorMessage = "The verification link was invalid or has expired.";
  } else if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password.";
  }

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>Authentication Error</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        {errorMessage}
      </p>
      <Link href="/auth/signin">
        <button className="btn-primary" style={{ padding: "10px 24px" }}>
          Back to Sign In
        </button>
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
      <div className="card" style={{ maxWidth: "400px", width: "100%" }}>
        <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>}>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}
