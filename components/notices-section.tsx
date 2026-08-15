import type { SiteNotice } from "@/lib/types";

export function NoticesSection({ notices }: { notices: SiteNotice[] }) {
  return (
    <section className="notices-section reveal-on-scroll" aria-label="Avisos importantes">
      <div className="notices-inner">
        <p className="section-kicker notices-kicker">Avisos importantes</p>
        {notices.map((notice) => (
          <article className="notice-item" key={notice.id}>
            <h3>{notice.title}</h3>
            <p>{notice.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
