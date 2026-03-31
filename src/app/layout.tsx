import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tiger Track | Job Leveling",
  description: "AI-powered job leveling tool by Tiger Data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
