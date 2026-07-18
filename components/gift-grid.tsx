"use client";

import { useEffect, useState } from "react";
import { DEFAULT_GIFT_IMAGE } from "@/lib/constants";
import type { PublicGiftView } from "@/lib/view-models";

type GiftState = PublicGiftView & {
  status: "available" | "selectedByYou" | "selectedByOther";
};

async function loadClientToken() {
  const key = "wedding-gift-reservation-token";
  let token = window.localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    window.localStorage.setItem(key, token);
  }
  return token;
}

export function GiftGrid({ gifts }: { gifts: PublicGiftView[] }) {
  const [token, setToken] = useState<string>("");
  const [ownedGiftIds, setOwnedGiftIds] = useState<string[]>([]);
  const [items, setItems] = useState<GiftState[]>(
    gifts.map((gift) => ({
      ...gift,
      status: gift.isReserved ? "selectedByOther" : "available"
    }))
  );
  const [loadingId, setLoadingId] = useState<string>("");

  useEffect(() => {
    loadClientToken().then(setToken).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!token) return;

    const sync = async () => {
      const response = await fetch("/api/gifts/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      if (!response.ok) return;
      const data = (await response.json()) as { giftIds: string[] };
      setOwnedGiftIds(data.giftIds);
    };

    sync().catch(() => undefined);
  }, [token]);

  useEffect(() => {
    setItems((current) =>
      current.map((gift) => ({
        ...gift,
        status: ownedGiftIds.includes(gift.id)
          ? "selectedByYou"
          : gift.isReserved
            ? "selectedByOther"
            : "available"
      }))
    );
  }, [ownedGiftIds]);

  async function reserveGift(giftId: string) {
    const currentToken = token || (await loadClientToken());
    setLoadingId(giftId);
    try {
      const response = await fetch("/api/gifts/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId, token: currentToken })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível reservar este presente.");
      }
      setOwnedGiftIds((current) => Array.from(new Set([...current, giftId])));
      setItems((current) =>
        current.map((gift) =>
          gift.id === giftId
            ? {
                ...gift,
                isReserved: true,
                status: "selectedByYou"
              }
            : gift
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Não foi possível reservar este presente.");
    } finally {
      setLoadingId("");
    }
  }

  async function releaseGift(giftId: string) {
    const currentToken = token || (await loadClientToken());
    setLoadingId(giftId);
    try {
      const response = await fetch("/api/gifts/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId, token: currentToken })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível liberar este presente.");
      }
      setOwnedGiftIds((current) => current.filter((id) => id !== giftId));
      setItems((current) =>
        current.map((gift) =>
          gift.id === giftId
            ? {
                ...gift,
                isReserved: false,
                status: "available"
              }
            : gift
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Não foi possível liberar este presente.");
    } finally {
      setLoadingId("");
    }
  }

  return (
    <div className="grid three gifts-grid">
      {items.map((gift) => {
        const isLoading = loadingId === gift.id;
        const image = gift.imagePath || DEFAULT_GIFT_IMAGE;

        return (
          <article className="card gift-card" key={gift.id}>
            <div className="gift-image-wrap">
              <img src={image} alt={gift.name} />
            </div>

            <div className="gift-card-body">
              <div className="gift-copy">
                <strong>{gift.name}</strong>
                {gift.description ? <p className="muted">{gift.description}</p> : null}
              </div>

              <div className="gift-actions">
                {gift.status === "available" ? (
                  <button className="btn btn-primary gift-button" disabled={isLoading} onClick={() => reserveGift(gift.id)} type="button">
                    {isLoading ? "Reservando..." : "Presentear"}
                  </button>
                ) : null}

                {gift.status === "selectedByYou" ? (
                  <>
                    <span className="btn btn-secondary gift-button" style={{ cursor: "default" }}>
                      Escolhido por você
                    </span>
                    <button className="btn btn-secondary gift-button" disabled={isLoading} onClick={() => releaseGift(gift.id)} type="button">
                      {isLoading ? "Liberando..." : "Desmarcar"}
                    </button>
                  </>
                ) : null}

                {gift.status === "selectedByOther" ? (
                  <span className="btn btn-secondary gift-button" style={{ cursor: "default" }}>
                    Presente já escolhido
                  </span>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
