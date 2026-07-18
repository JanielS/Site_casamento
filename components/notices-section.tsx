export function NoticesSection() {
  const notices = [
    {
      title: "Confirme sua presença",
      text: "Responda o quanto antes para nos ajudar na organização."
    },
    {
      title: "Pontualidade é essencial",
      text: "Chegar atrasado pode atrapalhar a cerimônia."
    },
    {
      title: "Silencie o celular",
      text: "Evite toques e notificações durante a cerimônia."
    }
  ];

  return (
    <section className="notices-section" aria-label="Avisos importantes">
      <div className="notices-inner">
        <p className="section-kicker notices-kicker">Avisos importantes</p>
        {notices.map((notice) => (
          <article className="notice-item" key={notice.title}>
            <h3>{notice.title}</h3>
            <p>{notice.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
