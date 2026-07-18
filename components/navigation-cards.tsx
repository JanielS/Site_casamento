import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

function ChurchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" focusable="false">
      <path d="M24 7v7" />
      <path d="M20.5 10.5h7" />
      <path d="M12 41V22l12-8 12 8v19" />
      <path d="M8 41h32" />
      <path d="M20 41V29a4 4 0 0 1 8 0v12" />
      <path d="M17 25h.01" />
      <path d="M31 25h.01" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" focusable="false">
      <path d="M10 21h28v20H10z" />
      <path d="M8 14h32v7H8z" />
      <path d="M24 14v27" />
      <path d="M14 14c-1.5-4.5 1.5-7 5-5 2.5 1.4 5 5 5 5" />
      <path d="M34 14c1.5-4.5-1.5-7-5-5-2.5 1.4-5 5-5 5" />
    </svg>
  );
}

export function NavigationCards({ settings }: { settings: SiteSettings }) {
  return (
    <section className="content-section access-section reveal-on-scroll">
      <div className="access-link-row">
        <a className="access-link reveal-on-scroll reveal-delay-1" href={settings.churchMapsUrl} target="_blank" rel="noopener noreferrer">
          <span className="access-icon">
            <ChurchIcon />
          </span>
          <strong>Local da cerimônia</strong>
        </a>

        <Link className="access-link reveal-on-scroll reveal-delay-2" href="/presentes">
          <span className="access-icon">
            <GiftIcon />
          </span>
          <strong>Lista de presentes</strong>
        </Link>
      </div>
    </section>
  );
}
