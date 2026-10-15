import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { RoutePending } from "@/components/layout/RoutePending";
import { ThemeColorSync } from "@/components/ThemeColorSync";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalLoadingBar } from "@/components/ui/global-loading-bar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Acompanhamento Chegada de Moto",
    template: "%s | Acompanhamento Chegada de Moto",
  },
  description: "Sistema de gerenciamento de concessionária de motocicletas.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="data-theme"
          value={{ light: "auge-light", dark: "auge-dark" }}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeColorSync />
          <GlobalLoadingBar />
          <TooltipProvider>
            <Suspense fallback={<RoutePending />}>{children}</Suspense>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
