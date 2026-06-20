import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import MainNav from "@/components/navbar/MainNav";
import { ThemeProvider } from "@/components/theme-provider";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebVFX",
  description:
    "WebVFX is a next-generation, browser-native visual programming hub built on Next.js for web developers and game studios. Powered by a React Flow node graph and the Claude API, it allows users to instantly generate advanced shaders via Prompt-to-TSL/GLSL AI automation. Unlike legacy alternatives, it features seamless, real-time team collaboration powered by LiveblocksIts standout advantage is absolute pipeline flexibility: it natively exports Three.js Shading Language (TSL) and React Three Fiber code, ensuring future-proof WebGPU and WebGL2 execution. Furthermore, dedicated extensions bridge the gap to traditional gaming workflows by deploying assets directly to major engines like Godot, Unity, and UE5. It effectively collapses the wall between web-based creative coding and AAA game asset production.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        dmSans.variable,
      )}
      suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <MainNav />
          <main className="flex-1 overflow-hidden">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
