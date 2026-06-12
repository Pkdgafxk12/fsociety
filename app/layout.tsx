import type { Metadata } from "next";
import "@fontsource/orbitron/700.css";
import "@fontsource/rajdhani/400.css";
import "@fontsource/rajdhani/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FSOCIETY AI",
  description: "Control Is An Illusion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}