import { AudioControls } from "@/components/audio-controls";
import { getMediaForSettings } from "@/lib/media";
import type { SiteSettings } from "@/lib/types";

export function HeroSection({ settings }: { settings: SiteSettings }) {
  const media = getMediaForSettings(settings);
  const coupleNames = settings.coupleNames.replace("✶", "𝄞");

  return (
    <section className="hero-flow" aria-label="Abertura do casamento">
      <div className="hero-video-wrap">
        <video className="hero-video" autoPlay muted loop playsInline preload="auto">
          <source src={media.video} type="video/mp4" />
        </video>
      </div>

      <div className="hero-transition">
        <div className="hero-copy">
          <p className="hero-names">{coupleNames}</p>
          <p className="hero-phrase">
            Entre notas que elevaram nossa oração a Deus, nasceu um amor que hoje volta ao altar como oferta de nossas
            vidas.
          </p>
        </div>
        <AudioControls />
      </div>
    </section>
  );
}
