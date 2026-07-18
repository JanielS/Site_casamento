import { WEDDING_TZ } from "@/lib/constants";

export function formatWeddingDateTime(iso: string) {
  const date = new Date(iso);
  const weekday = new Intl.DateTimeFormat("pt-BR", {
    timeZone: WEDDING_TZ,
    weekday: "long"
  }).format(date);

  return {
    date: new Intl.DateTimeFormat("pt-BR", {
      timeZone: WEDDING_TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date),
    time: new Intl.DateTimeFormat("pt-BR", {
      timeZone: WEDDING_TZ,
      hour: "2-digit",
      minute: "2-digit"
    }).format(date),
    weekday: weekday.replace(/^\w/, (letter) => letter.toUpperCase())
  };
}

export function getWeddingCountdown(targetIso: string, now = new Date()) {
  const target = new Date(targetIso).getTime();
  const diff = Math.max(target - now.getTime(), 0);

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    finished: diff <= 0
  };
}

export function formatRelativeStatus(targetIso: string) {
  const target = new Date(targetIso).getTime();
  return target <= Date.now()
    ? "Chegou o nosso grande dia!"
    : "Contagem regressiva para o nosso dia";
}
