import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { PostHogPageview } from "@/providers/posthog-pageview";
import { PostHogProvider } from "@/providers/posthog-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "JobPilot — AI Job Hunting Assistant",
  description:
    "Your AI-powered job hunting co-pilot. Discover relevant jobs, score matches against your profile, research companies, and apply with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full font-sans`}>
      <PostHogProvider>
        <body className="min-h-full flex flex-col font-sans">
          <Suspense fallback={null}>
            <PostHogPageview />
          </Suspense>
          {children}
        </body>
      </PostHogProvider>
    </html>
  );
}
