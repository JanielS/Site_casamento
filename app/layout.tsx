import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/audio-provider";
import { GlobalAudioPlayer } from "@/components/global-audio-player";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getSiteSettings } from "@/lib/excel";
import type { ReactNode } from "react";
import { getMediaForSettings } from "@/lib/media";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap"
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap"
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.janiellina.com.br");

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const media = getMediaForSettings(settings);

  return {
    metadataBase: siteUrl,
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteTitle}`
    },
    description: settings.siteDescription,
    openGraph: {
      title: settings.siteTitle,
      description: settings.siteDescription,
      url: siteUrl.toString(),
      siteName: settings.siteTitle,
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: media.heroImage,
          width: 1200,
          height: 630,
          alt: settings.siteTitle
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteTitle,
      description: settings.siteDescription,
      images: [media.heroImage]
    }
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${sourceSans.variable}`}>
      <body>
        <AudioProvider initialTrack={{ title: "O mundo é nós", src: settings.audioUrl }}>
          <div className="page-shell">
            {children}
          </div>
          <GlobalAudioPlayer />
          <ScrollReveal />
        </AudioProvider>
      </body>
    </html>
  );
}
