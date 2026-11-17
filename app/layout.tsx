import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arcade Vault",
  description: "Juega online y compite por la puntuación más alta.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${pressStart.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body>
        <div className="av-bg" aria-hidden="true" />
        <div className="av-noise" aria-hidden="true" />
        <SessionProvider>
          <Nav />
          <main className="av-main">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
