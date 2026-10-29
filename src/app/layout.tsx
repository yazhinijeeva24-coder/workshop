import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pennypilot.app"),
  title: "PennyPilot — Effortless Expense Tracking for Everyone",
  description:
    "Track expenses in two seconds: just type 'lunch 250' and PennyPilot detects the amount, category and day automatically. No signup, guided how-to, budget guard rails, insights and CSV export.",
  keywords: [
    "expense tracker",
    "money management",
    "budget",
    "spending tracker",
    "personal finance",
    "PennyPilot",
  ],
  authors: [{ name: "PennyPilot" }],
  manifest: "/manifest.webmanifest",
  applicationName: "PennyPilot",
  openGraph: {
    title: "PennyPilot — Effortless Expense Tracking",
    description:
      "No forms. No logins. Type an expense in one line and get instant insights, budget guard rails and CSV export.",
    siteName: "PennyPilot",
    type: "website",
    images: [
      {
        url: "/pics/hero-wallet.png",
        width: 1152,
        height: 864,
        alt: "Person happily tracking expenses on a phone surrounded by coins and charts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PennyPilot — Effortless Expense Tracking",
    description:
      "No forms. No logins. Type an expense in one line and get instant insights, budget guard rails and CSV export.",
    images: ["/pics/hero-wallet.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
