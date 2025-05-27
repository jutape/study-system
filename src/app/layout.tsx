import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Material de Estudo e Quizzes",
  description: "Uma coleção de material de estudo em markdown com quizzes interativos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <header className="border-b">
            <div className="container mx-auto py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-semibold hover:text-primary">
                Study Markdown
              </Link>
              <nav className="flex items-center gap-6">
                <ul className="flex gap-6">
                  <li>
                    <Link href="/" className="hover:text-primary">
                      Home
                    </Link>
                  </li>
                </ul>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="min-h-[calc(100vh-136px)]">{children}</main>
          <footer className="border-t py-6">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
              <p>Study Markdown App with Quizzes - Built with Next.js and shadcn/ui</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
