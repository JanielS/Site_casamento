"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_GIFT_IMAGE } from "@/lib/constants";
import type { PublicGiftView } from "@/lib/view-models";

type GiftState = PublicGiftView & {
  status: "available" | "selectedByYou" | "selectedByOther";
  ownedQuantity: number;
  selectableQuantity: number;
};

type OwnedReservation = {
  giftId: string;
  quantity: number;
  guestName: string;
};

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.janiellina.com.br";

function buildPrivateAccessUrl(token: string) {
  return `${PUBLIC_SITE_URL.replace(/\/$/, "")}/presentes?access=${encodeURIComponent(token)}`;
}

async function loadClientToken() {
  const key = "wedding-gift-reservation-token";
  let token = window.localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    window.localStorage.setItem(key, token);
  }
  return token;
}

function clampQuantity(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(value, max));
}

export function GiftGrid({ gifts }: { gifts: PublicGiftView[] }) {
  const [token, setToken] = useState("");
  const [items, setItems] = useState(gifts);
  const [ownedReservations, setOwnedReservations] = useState<Record<string, OwnedReservation>>({});
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});
  const [draftGuestNames, setDraftGuestNames] = useState<Record<string, string>>({});
  const [expandedGiftId, setExpandedGiftId] = useState("");
  const [loadingId, setLoadingId] = useState("");
  const [copiedLinkGiftId, setCopiedLinkGiftId] = useState("");
  const [privateLinkGiftId, setPrivateLinkGiftId] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setItems(gifts);
  }, [gifts]);

  const refreshPublicGifts = async () => {
    const response = await fetch("/api/gifts", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as PublicGiftView[];
    setItems(payload);
  };

  const refreshOwnedReservations = async (currentToken = token) => {
    if (!currentToken) return;
    const response = await fetch("/api/gifts/mine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: currentToken })
    });
    if (!response.ok) return;
    const payload = (await response.json()) as { reservations?: OwnedReservation[] };
    const nextOwned: Record<string, OwnedReservation> = {};
    payload.reservations?.forEach((reservation) => {
      nextOwned[reservation.giftId] = reservation;
    });
    setOwnedReservations(nextOwned);
  };

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("access")?.trim() ?? "";
    if (urlToken) {
      window.localStorage.setItem("wedding-gift-reservation-token", urlToken);
      setToken(urlToken);
      return;
    }

    loadClientToken().then(setToken).catch(() => undefined);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!token) return;
    refreshOwnedReservations(token).catch(() => undefined);
  }, [token]);

  const cards = useMemo<GiftState[]>(
    () =>
      items.map((gift) => {
        const ownedReservation = ownedReservations[gift.id];
        const ownedQuantity = ownedReservation?.quantity ?? 0;
        const status = ownedQuantity > 0 ? "selectedByYou" : gift.isFullyReserved ? "selectedByOther" : "available";
        const selectableQuantity = Math.max(gift.availableQuantity + ownedQuantity, ownedQuantity || 0);
        return {
          ...gift,
          status,
          ownedQuantity,
          selectableQuantity
        };
      }),
    [items, ownedReservations]
  );

  const privateAccessUrl = useMemo(() => {
    if (!token) return "";
    return buildPrivateAccessUrl(token);
  }, [token]);

  const privateLinkGift = useMemo(
    () => cards.find((gift) => gift.id === privateLinkGiftId) ?? null,
    [cards, privateLinkGiftId]
  );

  useEffect(() => {
    if (!privateLinkGiftId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [privateLinkGiftId]);

  useEffect(() => {
    setDraftQuantities((current) => {
      const next = { ...current };

      cards.forEach((gift) => {
        const max = Math.max(gift.selectableQuantity, gift.ownedQuantity || 1);
        const fallback = gift.ownedQuantity > 0 ? gift.ownedQuantity : 1;
        const currentValue = next[gift.id];

        if (gift.status === "selectedByOther" && gift.ownedQuantity === 0) {
          delete next[gift.id];
          return;
        }

        next[gift.id] = clampQuantity(currentValue ?? fallback, 1, Math.max(max, 1));
      });

      return next;
    });

    setDraftGuestNames((current) => {
      const next = { ...current };

      cards.forEach((gift) => {
        const ownedName = ownedReservations[gift.id]?.guestName ?? "";
        const currentValue = next[gift.id] ?? "";

        if (gift.status === "selectedByOther" && gift.ownedQuantity === 0) {
          delete next[gift.id];
          return;
        }

        next[gift.id] = currentValue || ownedName;
      });

      return next;
    });

    if (expandedGiftId && !cards.some((gift) => gift.id === expandedGiftId)) {
      setExpandedGiftId("");
    }
  }, [cards, expandedGiftId, ownedReservations]);

  useEffect(() => {
    if (!expandedGiftId) return;
    const gift = cards.find((item) => item.id === expandedGiftId);
    if (!gift) return;

    const maxQuantity = Math.max(gift.status === "selectedByYou" ? gift.selectableQuantity : gift.availableQuantity, 1);
    const fallbackQuantity = gift.status === "selectedByYou" ? gift.ownedQuantity || 1 : 1;
    const fallbackName = ownedReservations[gift.id]?.guestName ?? "";

    setDraftQuantities((current) => ({
      ...current,
      [gift.id]: clampQuantity(current[gift.id] ?? fallbackQuantity, 1, maxQuantity)
    }));
    setDraftGuestNames((current) => ({
      ...current,
      [gift.id]: current[gift.id] ?? fallbackName
    }));
  }, [expandedGiftId, cards, ownedReservations]);

  async function reserveGift(gift: GiftState) {
    const currentToken = token || (await loadClientToken());
    const maxQuantity = gift.status === "selectedByYou" ? gift.selectableQuantity : gift.availableQuantity;
    const requestedQuantity = draftQuantities[gift.id] ?? (gift.ownedQuantity || 1);
    const quantity = clampQuantity(requestedQuantity, 1, Math.max(maxQuantity, 1));
    const guestName = draftGuestNames[gift.id]?.trim();

    if (!guestName) {
      alert("Informe seu nome para reservar este presente.");
      return;
    }

    setLoadingId(gift.id);
    try {
      const response = await fetch("/api/gifts/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: gift.id, token: currentToken, quantity, guestName })
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? "Não foi possível reservar este presente.");
      }

      setExpandedGiftId(gift.id);
      setPrivateLinkGiftId(gift.id);
      await Promise.all([refreshPublicGifts(), refreshOwnedReservations(currentToken)]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Não foi possível reservar este presente.");
    } finally {
      setLoadingId("");
    }
  }

  async function copyPrivateAccessLink(giftId: string) {
    if (!privateAccessUrl) return;
    await navigator.clipboard.writeText(privateAccessUrl);
    setCopiedLinkGiftId(giftId);
    window.setTimeout(() => {
      setCopiedLinkGiftId("");
    }, 1800);
  }

  function closePrivateLinkModal() {
    setPrivateLinkGiftId("");
    setExpandedGiftId("");
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
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? "Não foi possível liberar este presente.");
      }

      setExpandedGiftId("");
      await Promise.all([refreshPublicGifts(), refreshOwnedReservations(currentToken)]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Não foi possível liberar este presente.");
    } finally {
      setLoadingId("");
    }
  }

  function togglePanel(gift: GiftState) {
    if (gift.status === "selectedByOther") return;
    setPrivateLinkGiftId("");
    setExpandedGiftId((current) => (current === gift.id ? "" : gift.id));
  }

  return (
    <div className="grid three gifts-grid">
      {cards.map((gift, index) => {
        const isLoading = loadingId === gift.id;
        const image = gift.imagePath || DEFAULT_GIFT_IMAGE;
        const isExpanded = expandedGiftId === gift.id;
        const showQuantityPanel = isExpanded && gift.quantity > 1;
        const quantityValue = draftQuantities[gift.id] ?? (gift.ownedQuantity > 0 ? gift.ownedQuantity : 1);
        const guestNameValue = draftGuestNames[gift.id] ?? "";

        return (
          <article className={`card gift-card reveal-on-scroll reveal-delay-${index % 4}`} key={gift.id}>
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
                  <>
                    <button
                      className="btn btn-primary gift-button"
                      disabled={isLoading || gift.availableQuantity < 1}
                      onClick={() => togglePanel(gift)}
                      type="button"
                      aria-expanded={isExpanded}
                    >
                      {isLoading ? "Reservando..." : "Presentear"}
                    </button>

                    {isExpanded ? (
                      <div className="gift-panel" aria-live="polite">
                        <div>
                          <label className="label" htmlFor={`gift-name-${gift.id}`}>
                            Seu nome
                          </label>
                          <input
                            id={`gift-name-${gift.id}`}
                            className="input"
                            value={guestNameValue}
                            onChange={(event) =>
                              setDraftGuestNames((current) => ({
                                ...current,
                                [gift.id]: event.target.value
                              }))
                            }
                            placeholder="Como você prefere ser identificado"
                          />
                        </div>
                        {showQuantityPanel ? (
                          <div>
                            <p className="gift-stock">
                              Disponíveis agora: {gift.availableQuantity} de {gift.quantity}
                            </p>
                            <label className="label" htmlFor={`gift-quantity-${gift.id}`}>
                              Quantidade
                            </label>
                            <input
                              id={`gift-quantity-${gift.id}`}
                              className="input gift-quantity-input"
                              type="number"
                              min={1}
                              max={Math.max(gift.availableQuantity, 1)}
                              value={quantityValue}
                              onChange={(event) =>
                                setDraftQuantities((current) => ({
                                  ...current,
                                  [gift.id]: clampQuantity(Number(event.target.value), 1, Math.max(gift.availableQuantity, 1))
                                }))
                              }
                            />
                          </div>
                        ) : null}
                        <div className="gift-panel-actions">
                          <button className="btn btn-primary gift-button" disabled={isLoading} onClick={() => reserveGift(gift)} type="button">
                            {isLoading ? "Confirmando..." : "Confirmar presente"}
                          </button>
                          <button
                            className="btn btn-secondary gift-button"
                            disabled={isLoading}
                            onClick={() => setExpandedGiftId("")}
                            type="button"
                          >
                            Fechar
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {gift.status === "selectedByYou" ? (
                  <>
                    <span className="btn btn-secondary gift-button" style={{ cursor: "default" }}>
                      Escolhido por você
                    </span>
                    <button
                      className="btn btn-primary gift-button"
                      disabled={isLoading}
                      onClick={() => togglePanel(gift)}
                      type="button"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Fechar" : "Atualizar reserva"}
                    </button>
                    <button className="btn btn-secondary gift-button" disabled={isLoading} onClick={() => releaseGift(gift.id)} type="button">
                      {isLoading ? "Liberando..." : "Desmarcar"}
                    </button>

                    {isExpanded ? (
                      <div className="gift-panel" aria-live="polite">
                        <p className="gift-privacy-note">
                          Seu nome continua privado e visível apenas para os noivos.
                        </p>
                        <div>
                          <label className="label" htmlFor={`gift-name-${gift.id}`}>
                            Seu nome
                          </label>
                          <input
                            id={`gift-name-${gift.id}`}
                            className="input"
                            value={guestNameValue}
                            onChange={(event) =>
                              setDraftGuestNames((current) => ({
                                ...current,
                                [gift.id]: event.target.value
                              }))
                            }
                            placeholder="Como você prefere ser identificado"
                          />
                        </div>
                        {gift.quantity > 1 ? (
                          <div>
                            <p className="gift-stock">
                              Disponíveis agora: {gift.availableQuantity} de {gift.quantity}
                            </p>
                            <label className="label" htmlFor={`gift-quantity-${gift.id}`}>
                              Quantidade
                            </label>
                            <input
                              id={`gift-quantity-${gift.id}`}
                              className="input gift-quantity-input"
                              type="number"
                              min={1}
                              max={Math.max(gift.selectableQuantity, 1)}
                              value={quantityValue}
                              onChange={(event) =>
                                setDraftQuantities((current) => ({
                                  ...current,
                                  [gift.id]: clampQuantity(Number(event.target.value), 1, Math.max(gift.selectableQuantity, 1))
                                }))
                              }
                            />
                          </div>
                        ) : null}
                        <div className="gift-panel-actions">
                          <button className="btn btn-primary gift-button" disabled={isLoading} onClick={() => reserveGift(gift)} type="button">
                            {isLoading ? "Atualizando..." : "Confirmar atualização"}
                          </button>
                          <button
                            className="btn btn-secondary gift-button"
                            disabled={isLoading}
                            onClick={() => setExpandedGiftId("")}
                            type="button"
                          >
                            Fechar
                          </button>
                        </div>
                      </div>
                    ) : null}
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

      {isMounted && privateLinkGift && privateAccessUrl
        ? createPortal(
            <div className="gift-modal-overlay" role="presentation" onClick={closePrivateLinkModal}>
              <div
                className="gift-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="gift-private-link-title"
                aria-describedby="gift-private-link-description"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="gift-modal-header">
                  <div className="gift-modal-heading">
                    <span className="gift-modal-badge" aria-hidden="true">
                      i
                    </span>
                    <div>
                      <span className="eyebrow">Link privado salvo</span>
                      <h2 id="gift-private-link-title" className="section-title" style={{ marginTop: 12 }}>
                        {privateLinkGift.name}
                      </h2>
                    </div>
                  </div>
                  <button className="btn btn-secondary" type="button" onClick={closePrivateLinkModal}>
                    Fechar
                  </button>
                </div>

                <div className="gift-notice-copy">
                  <p id="gift-private-link-description">
                    Guarde este link se quiser abrir sua escolha em outro dispositivo. Ele leva direto para a lista de presentes.
                    Qualquer problema, pode entrar em contato com os noivos.
                  </p>
                </div>

                <div className="gift-link-row">
                  <input className="input gift-link-input" readOnly value={privateAccessUrl} />
                  <button className="btn btn-primary gift-button" type="button" onClick={() => void copyPrivateAccessLink(privateLinkGift.id)}>
                    {copiedLinkGiftId === privateLinkGift.id ? "Copiado ✓" : "Copiar link"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
