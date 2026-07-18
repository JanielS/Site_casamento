import { Countdown } from "@/components/countdown";
import { HeroSection } from "@/components/hero-section";
import { NavigationCards } from "@/components/navigation-cards";
import { NoticesSection } from "@/components/notices-section";
import { RSVPForm } from "@/components/rsvp-form";
import { getSiteSettings } from "@/lib/excel";
import { formatWeddingDateTime } from "@/lib/date";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const formatted = formatWeddingDateTime(settings.weddingDate);

  return (
    <main className="site-flow">
      <HeroSection settings={settings} />

      <section className="content-section countdown-section">
        <h2 className="section-title countdown-title">CONTAGEM REGRESSIVA</h2>
        <Countdown targetIso={settings.weddingDate} />
      </section>

      <section className="date-rsvp-section" id="rsvp">
        <div className="date-content">
          <p className="section-kicker invitation-text">Convidamos você para a cerimônia do nosso casamento</p>
          <h2 className="date-title">23 . JANEIRO . 2027</h2>
          <p className="date-subtitle">
            {formatted.weekday} às {formatted.time}
          </p>
          <RSVPForm />
        </div>

        <div className="confirmation-photo">
          <img src={settings.confirmationImageUrl} alt="Lina e Janiel em foto de confirmação" />
        </div>
      </section>

      <NoticesSection />

      <NavigationCards settings={settings} />
    </main>
  );
}
