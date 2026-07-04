import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { BridgeProvider } from "@/components/bridge-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { HeaderNav } from "@/components/header-nav";
import { Star } from "lucide-react";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const appName = "Курьер Маркет";

export const metadata: Metadata = {
  title: appName,
  description: appName,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={cn("font-sans", geist.variable)}>
      <body className="antialiased min-h-screen bg-background flex flex-col">
        <BridgeProvider />
        <AuthProvider>
          <HeaderNav />
          <main className="flex-1">{children}</main>
          <footer className="border-t">
            <div className="container mx-auto px-4 py-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} {appName}
              </p>
              <a
                href="https://2gis.ru/nahodka/geo/70000001109683072"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Star className="h-3.5 w-3.5" />
                Оставить отзыв на 2ГИС
              </a>
            </div>
          </footer>
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
