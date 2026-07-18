"use client";

import { useMemo, useState } from "react";
import type { WorkbookSnapshot } from "@/lib/types";

type GiftDraft = {
  id?: string;
  name: string;
  imagePath: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export function AdminDashboard({ initialData }: { initialData: WorkbookSnapshot }) {
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState("");
  const [giftDraft, setGiftDraft] = useState<GiftDraft>({
    name: "",
    imagePath: "",
    description: "",
    sortOrder: data.gifts.length + 1,
    isActive: true
  });

  const totals = useMemo(() => {
    const confirmed = data.rsvp.filter((entry) => entry.willAttend).reduce((sum, entry) => sum + entry.guestCount, 0);
    return {
      responses: data.rsvp.length,
      confirmedGuests: confirmed,
      gifts: data.gifts.length,
      reservedGifts: data.giftReservations.length
    };
  }, [data]);

  async function refresh() {
    const response = await fetch("/api/admin/data", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as WorkbookSnapshot;
    setData(payload);
  }

  async function saveSettings() {
    setStatus("Salvando configurações...");
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.settings)
    });
    if (!response.ok) {
      setStatus("Nao foi possivel salvar as configuracoes.");
      return;
    }
    setStatus("Configurações salvas.");
    await refresh();
  }

  async function saveGift() {
    setStatus("Salvando presente...");
    const response = await fetch("/api/admin/gifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(giftDraft)
    });
    if (!response.ok) {
      setStatus("Nao foi possivel salvar o presente.");
      return;
    }
    setGiftDraft({
      name: "",
      imagePath: "",
      description: "",
      sortOrder: data.gifts.length + 2,
      isActive: true
    });
    setStatus("Presente salvo.");
    await refresh();
  }

  async function uploadGiftImage(file: File, giftId?: string) {
    const formData = new FormData();
    formData.set("file", file);
    if (giftId) {
      formData.set("giftId", giftId);
    }

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Nao foi possivel enviar a foto.");
    }

    const data = (await response.json()) as { imagePath: string };
    return data.imagePath;
  }

  async function updateGift(giftId: string, patch: Partial<GiftDraft>) {
    const gift = data.gifts.find((entry) => entry.id === giftId);
    if (!gift) return;
    const { id: _giftId, ...giftPayload } = gift;
    const response = await fetch("/api/admin/gifts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: giftId,
        ...giftPayload,
        ...patch
      })
    });
    if (response.ok) {
      setStatus("Presente atualizado.");
      await refresh();
    }
  }

  async function deactivateGift(giftId: string) {
    const response = await fetch("/api/admin/gifts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: giftId })
    });
    if (response.ok) {
      setStatus("Presente desativado.");
      await refresh();
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  async function exportRsvp() {
    const response = await fetch("/api/rsvp/export", { cache: "no-store" });
    if (!response.ok) {
      setStatus("Nao foi possivel exportar.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "confirmacoes-casamento-lina-janiel.xlsx";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="card card-pad" style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <span className="eyebrow">Painel administrativo</span>
          <h1 className="section-title" style={{ marginTop: 12 }}>
            Gerenciar casamento
          </h1>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button className="btn btn-secondary" type="button" onClick={refresh}>
            Atualizar dados
          </button>
          <button className="btn btn-secondary" type="button" onClick={exportRsvp}>
            Exportar RSVP
          </button>
          <button className="btn btn-secondary" type="button" onClick={logout}>
            Sair
          </button>
        </div>
      </div>

      <div className="grid four" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        <article className="card card-pad">
          <strong style={{ fontSize: "1.8rem", color: "var(--color-wine)" }}>{totals.responses}</strong>
          <div className="muted">respostas RSVP</div>
        </article>
        <article className="card card-pad">
          <strong style={{ fontSize: "1.8rem", color: "var(--color-wine)" }}>{totals.confirmedGuests}</strong>
          <div className="muted">convidados confirmados</div>
        </article>
        <article className="card card-pad">
          <strong style={{ fontSize: "1.8rem", color: "var(--color-wine)" }}>{totals.gifts}</strong>
          <div className="muted">presentes cadastrados</div>
        </article>
        <article className="card card-pad">
          <strong style={{ fontSize: "1.8rem", color: "var(--color-wine)" }}>{totals.reservedGifts}</strong>
          <div className="muted">reservas ativas</div>
        </article>
      </div>

      <section className="card card-pad stack">
        <h2 className="section-title">Configurações do site</h2>
        <div className="grid two">
          {Object.entries(data.settings).map(([key, value]) => (
            <div key={key}>
              <label className="label" htmlFor={`setting-${key}`}>
                {key}
              </label>
              <input
                id={`setting-${key}`}
                className="input"
                value={String(value)}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    settings: {
                      ...current.settings,
                      [key as keyof typeof current.settings]: event.target.value
                    }
                  }))
                }
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" type="button" onClick={saveSettings}>
          Salvar configurações
        </button>
      </section>

      <section className="card card-pad stack">
        <h2 className="section-title">Novo presente</h2>
        <div className="grid two">
          <div>
            <label className="label" htmlFor="gift-name">
              Nome
            </label>
            <input
              id="gift-name"
              className="input"
              value={giftDraft.name}
              onChange={(event) => setGiftDraft((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="gift-sort">
              Ordem
            </label>
            <input
              id="gift-sort"
              className="input"
              type="number"
              min={1}
              value={giftDraft.sortOrder}
              onChange={(event) =>
                setGiftDraft((current) => ({ ...current, sortOrder: Number(event.target.value) }))
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="gift-image">
              Foto
            </label>
            <input
              id="gift-image"
              className="input"
              value={giftDraft.imagePath}
              onChange={(event) => setGiftDraft((current) => ({ ...current, imagePath: event.target.value }))}
              placeholder="/uploads/gifts/exemplo.jpg"
            />
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const imagePath = await uploadGiftImage(file);
                setGiftDraft((current) => ({ ...current, imagePath }));
              }}
            />
          </div>
          <div>
            <label className="label" htmlFor="gift-active">
              Ativo
            </label>
            <select
              id="gift-active"
              className="select"
              value={String(giftDraft.isActive)}
              onChange={(event) =>
                setGiftDraft((current) => ({ ...current, isActive: event.target.value === "true" }))
              }
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="gift-description">
            Descrição
          </label>
          <textarea
            id="gift-description"
            className="textarea"
            value={giftDraft.description}
            onChange={(event) => setGiftDraft((current) => ({ ...current, description: event.target.value }))}
          />
        </div>
        <button className="btn btn-primary" type="button" onClick={saveGift}>
          Salvar presente
        </button>
      </section>

      <section className="card card-pad stack">
        <h2 className="section-title">Presentes cadastrados</h2>
        <div className="stack">
          {data.gifts.map((gift) => (
            <div key={gift.id} className="card card-pad stack">
              <div className="grid two" style={{ alignItems: "end" }}>
                <div>
                  <label className="label">Nome</label>
                  <input
                    className="input"
                    value={gift.name}
                    onChange={(event) => updateGift(gift.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Ordem</label>
                  <input
                    className="input"
                    type="number"
                    value={gift.sortOrder}
                    onChange={(event) => updateGift(gift.id, { sortOrder: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Imagem</label>
                  <input
                    className="input"
                    value={gift.imagePath}
                    onChange={(event) => updateGift(gift.id, { imagePath: event.target.value })}
                  />
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const imagePath = await uploadGiftImage(file, gift.id);
                      await updateGift(gift.id, { imagePath });
                    }}
                  />
                </div>
                <div>
                  <label className="label">Ativo</label>
                  <select
                    className="select"
                    value={String(gift.isActive)}
                    onChange={(event) => updateGift(gift.id, { isActive: event.target.value === "true" })}
                  >
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea
                  className="textarea"
                  value={gift.description}
                  onChange={(event) => updateGift(gift.id, { description: event.target.value })}
                />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <button className="btn btn-secondary" type="button" onClick={() => deactivateGift(gift.id)}>
                  Desativar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card card-pad stack">
        <h2 className="section-title">Respostas RSVP</h2>
        <div className="stack">
          {data.rsvp.map((entry) => (
            <div key={entry.id} className="card card-pad" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>{entry.name}</strong>
              <span>{entry.willAttend ? "Sim" : "Nao"}</span>
              <span>{entry.guestCount} pessoa(s)</span>
              <span>{entry.updatedAt}</span>
            </div>
          ))}
        </div>
      </section>

      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
