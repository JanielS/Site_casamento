import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/audio-provider";
import { GlobalAudioPlayer } from "@/components/global-audio-player";
import { getSiteSettings } from "@/lib/excel";
import type { ReactNode } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Lina e Janiel",
  description: "Site de casamento de Lina e Janiel.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="pt-BR" className={cormorant.variable}>
      <body>
        <AudioProvider initialTrack={{ title: "O mundo é nós", src: settings.audioUrl }}>
          <div className="page-shell">
            {children}
          </div>
          <GlobalAudioPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
