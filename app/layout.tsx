import type { Metadata } from "next";
import { Crimson_Pro, IBM_Plex_Mono, Amiri } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const crimsonPro = Crimson_Pro({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const amiri = Amiri({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "BAYT OS — Seedat Family",
  description: "Family Operating System for the Seedat Family in Doha",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${crimsonPro.variable} ${ibmPlexMono.variable} ${amiri.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
