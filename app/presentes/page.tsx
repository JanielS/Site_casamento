import { GiftGrid } from "@/components/gift-grid";
import { HeroSection } from "@/components/hero-section";
import { getWorkbookSnapshot } from "@/lib/excel";
import { mapPublicGifts } from "@/lib/view-models";

export default async function PresentesPage() {
  const snapshot = await getWorkbookSnapshot();
  const gifts = mapPublicGifts(snapshot);

  return (
    <main className="site-flow">
      <HeroSection settings={snapshot.settings} />

      <section className="content-section presents-message">
        <p className="section-kicker">Lista de presentes</p>
        <h1 className="section-title">Nosso maior presente é a sua presença</h1>
        <p>
          Nosso maior presente é a sua presença nesta celebração, testemunhando a vocação que Deus nos confiou. No entanto,
          sabendo que muitos desejam expressar seu carinho também por meio de um presente, deixamos aqui uma lista de
          sugestões.
        </p>
      </section>

      <section className="content-section gifts-section">
        <GiftGrid gifts={gifts} />
      </section>
    </main>
  );
}
