"use client";

import { useEffect, useState } from "react";
import { getWeddingCountdown } from "@/lib/date";

type Props = {
  targetIso: string;
};

export function Countdown({ targetIso }: Props) {
  const [time, setTime] = useState<ReturnType<typeof getWeddingCountdown> | null>(null);

  useEffect(() => {
    const tick = () => setTime(getWeddingCountdown(targetIso));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [targetIso]);

  if (!time) {
    return (
      <div className="countdown-line" aria-label="Contagem regressiva carregando">
        <span className="countdown-part">
          <span>--</span>
          <b aria-hidden="true">:</b>
        </span>
        <span className="countdown-part">
          <span>--</span>
          <b aria-hidden="true">:</b>
        </span>
        <span className="countdown-part">
          <span>--</span>
          <b aria-hidden="true">:</b>
        </span>
        <span className="countdown-part">
          <span>--</span>
        </span>
      </div>
    );
  }

  if (time.finished) {
    return <p className="countdown-finished">Chegou o nosso grande dia!</p>;
  }

  const values = [time.days, time.hours, time.minutes, time.seconds];

  return (
    <div className="countdown-line" aria-label="Contagem regressiva">
      {values.map((value, index) => (
        <span className="countdown-part" key={index}>
          <span>{String(value).padStart(2, "0")}</span>
          {index < values.length - 1 ? <b aria-hidden="true">:</b> : null}
        </span>
      ))}
    </div>
  );
}
