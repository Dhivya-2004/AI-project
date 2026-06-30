import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AI Career Navigator | AI-Powered Career Management Platform",
  description:
    "Supercharge your job search with AI-powered resume analysis, ATS scoring, skill gap identification, job tracking, and personalized career recommendations.",
  keywords: [
    "AI resume analyzer",
    "ATS score",
    "job tracker",
    "career management",
    "job application tracking",
    "skill gap analysis",
  ],
  authors: [{ name: "AI Career Navigator" }],
  openGraph: {
    title: "AI Career Navigator",
    description: "AI-powered career management platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
