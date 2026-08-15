"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_GIFT_IMAGE } from "@/lib/constants";
import type { SiteNotice, WorkbookSnapshot } from "@/lib/types";

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.janiellina.com.br";

type GiftDraft = {
  id?: string;
  name: string;
  imagePath: string;
  description: string;
  quantity: number;
  sortOrder: number;
};

type SectionKey = "settings" | "newGift" | "gifts" | "reservations" | "rsvp";

function toDateTimeLocalValue(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDateTimeLocalValue(value: string) {
  return new Date(value).toISOString();
}

function createNoticeDraft(): SiteNotice {
  return {
    id: crypto.randomUUID(),
    title: "Novo aviso",
    text: "Escreva o texto do aviso aqui."
  };
}

function SectionShell({
  title,
  subtitle,
  sectionKey,
  isOpen,
  onToggle,
  children
}: {
  title: string;
  subtitle?: string;
  sectionKey: SectionKey;
  isOpen: boolean;
  onToggle: (section: SectionKey) => void;
  children: ReactNode;
}) {
  return (
    <section className="card card-pad stack">
      <div className="admin-section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="muted admin-inline-note">{subtitle}</p> : null}
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => onToggle(sectionKey)}>
          {isOpen ? "Minimizar" : "Expandir"}
        </button>
      </div>
      {isOpen ? children : null}
    </section>
  );
}

export function AdminDashboard({ initialData }: { initialData: WorkbookSnapshot }) {
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState("");
  const [settingsSaveState, setSettingsSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [newGiftSaveState, setNewGiftSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [showConfirmedOnly, setShowConfirmedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [giftSaveStates, setGiftSaveStates] = useState<Record<string, "idle" | "saving" | "saved">>({});
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    settings: true,
    newGift: false,
    gifts: true,
    reservations: true,
    rsvp: true
  });
  const [giftDraft, setGiftDraft] = useState<GiftDraft>({
    name: "",
    imagePath: "",
    description: "",
    quantity: 1,
    sortOrder: initialData.gifts.length + 1
  });
  const [giftEdits, setGiftEdits] = useState<Record<string, GiftDraft>>({});

  useEffect(() => {
    const nextEdits: Record<string, GiftDraft> = {};
    data.gifts.forEach((gift) => {
      nextEdits[gift.id] = {
        id: gift.id,
        name: gift.name,
        imagePath: gift.imagePath,
        description: gift.description,
        quantity: gift.quantity,
        sortOrder: gift.sortOrder
      };
    });
    setGiftEdits(nextEdits);
  }, [data.gifts]);

  const totals = useMemo(() => {
    const confirmedEntries = data.rsvp.filter((entry) => entry.willAttend);
    const confirmedGuests = confirmedEntries.reduce((sum, entry) => sum + entry.guestCount, 0);
    const reservedUnits = data.giftReservations.reduce((sum, reservation) => sum + reservation.quantity, 0);

    return {
      responses: data.rsvp.length,
      confirmedGuests,
      gifts: data.gifts.length,
      reservedUnits
    };
  }, [data]);

  const reservationsView = useMemo(() => {
    return data.giftReservations
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((reservation) => {
        const gift = data.gifts.find((entry) => entry.id === reservation.giftId);
        return {
          ...reservation,
          giftName: gift?.name ?? "Presente removido",
          giftImage: gift?.imagePath || DEFAULT_GIFT_IMAGE
        };
      });
  }, [data.giftReservations, data.gifts]);

  function buildPrivateAccessLink(accessToken: string) {
    if (!accessToken) return "";
    return `${PUBLIC_SITE_URL.replace(/\/$/, "")}/presentes?access=${encodeURIComponent(accessToken)}`;
  }

  const filteredGifts = useMemo(() => {
    const activeGifts = data.gifts.filter((gift) => gift.isActive);
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return activeGifts;
    return activeGifts.filter((gift) => {
      return [gift.name, gift.description, gift.sortOrder, gift.quantity]
        .map((value) => String(value).toLowerCase())
        .some((value) => value.includes(needle));
    });
  }, [data.gifts, searchTerm]);

  const visibleRsvp = showConfirmedOnly ? data.rsvp.filter((entry) => entry.willAttend) : data.rsvp;

  async function refresh() {
    const response = await fetch("/api/admin/data", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as WorkbookSnapshot;
    setData(payload);
  }

  async function saveSettings() {
    setSettingsSaveState("saving");
    setStatus("Salvando configurações...");
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.settings)
    });
    if (!response.ok) {
      setStatus("Nao foi possivel salvar as configuracoes.");
      setSettingsSaveState("idle");
      return;
    }
    setStatus("Configurações salvas.");
    setSettingsSaveState("saved");
    window.setTimeout(() => {
      setSettingsSaveState("idle");
    }, 2000);
    await refresh();
  }

  async function saveGift() {
    setNewGiftSaveState("saving");
    setStatus("Salvando presente...");
    const response = await fetch("/api/admin/gifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(giftDraft)
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(payload?.error ?? "Nao foi possivel salvar o presente.");
      setNewGiftSaveState("idle");
      return;
    }
    setGiftDraft({
      name: "",
      imagePath: "",
      description: "",
      quantity: 1,
      sortOrder: data.gifts.length + 2
    });
    setStatus("Presente salvo.");
    setNewGiftSaveState("saved");
    window.setTimeout(() => {
      setNewGiftSaveState("idle");
    }, 2000);
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

    const payload = (await response.json()) as { imagePath: string };
    return payload.imagePath;
  }

  async function saveGiftChanges(giftId: string) {
    const draft = giftEdits[giftId];
    if (!draft) return;
    setGiftSaveStates((current) => ({ ...current, [giftId]: "saving" }));
    setStatus("Salvando alterações do presente...");
    const response = await fetch("/api/admin/gifts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    if (response.ok) {
      setStatus("Presente atualizado.");
      setGiftSaveStates((current) => ({ ...current, [giftId]: "saved" }));
      window.setTimeout(() => {
        setGiftSaveStates((current) => ({ ...current, [giftId]: "idle" }));
      }, 2000);
      await refresh();
    } else {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setGiftSaveStates((current) => ({ ...current, [giftId]: "idle" }));
      setStatus(payload?.error ?? "Nao foi possivel atualizar o presente.");
    }
  }

  async function archiveGift(giftId: string) {
    const response = await fetch("/api/admin/gifts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: giftId })
    });
    if (response.ok) {
      setStatus("Presente excluído da vitrine.");
      await refresh();
    } else {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(payload?.error ?? "Nao foi possivel excluir o presente.");
    }
  }

  async function deleteRsvp(rsvpId: string) {
    const response = await fetch("/api/admin/rsvp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rsvpId })
    });
    if (response.ok) {
      setStatus("Resposta RSVP excluída.");
      await refresh();
    } else {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(payload?.error ?? "Nao foi possivel excluir a resposta.");
    }
  }

  async function copyPrivateAccessLink(accessToken: string) {
    const link = buildPrivateAccessLink(accessToken);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setStatus("Link privado copiado.");
    } catch {
      setStatus("Nao foi possivel copiar o link.");
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

  function updateSettingsField<K extends keyof WorkbookSnapshot["settings"]>(key: K, value: WorkbookSnapshot["settings"][K]) {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [key]: value
      }
    }));
  }

  function addNotice() {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        notices: [...current.settings.notices, createNoticeDraft()]
      }
    }));
  }

  function updateNotice(index: number, patch: Partial<SiteNotice>) {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        notices: current.settings.notices.map((notice, noticeIndex) =>
          noticeIndex === index ? { ...notice, ...patch } : notice
        )
      }
    }));
  }

  function removeNotice(index: number) {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        notices: current.settings.notices.filter((_, noticeIndex) => noticeIndex !== index)
      }
    }));
  }

  function moveNotice(index: number, direction: -1 | 1) {
    setData((current) => {
      const notices = [...current.settings.notices];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= notices.length) {
        return current;
      }

      const [moved] = notices.splice(index, 1);
      notices.splice(nextIndex, 0, moved);

      return {
        ...current,
        settings: {
          ...current.settings,
          notices
        }
      };
    });
  }

  function toggleSection(section: SectionKey) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section]
    }));
  }

  function updateGiftDraft(giftId: string, patch: Partial<GiftDraft>) {
    setGiftEdits((current) => ({
      ...current,
        [giftId]: {
          ...(current[giftId] ?? {
            id: giftId,
            name: "",
            imagePath: "",
            description: "",
            quantity: 1,
            sortOrder: 1
          }),
          ...patch,
          id: giftId
        }
    }));
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
          <strong style={{ fontSize: "1.8rem", color: "var(--color-wine)" }}>{totals.reservedUnits}</strong>
          <div className="muted">unidades de presentes reservadas</div>
        </article>
        <article className="card card-pad">
          <strong style={{ fontSize: "1.8rem", color: "var(--color-wine)" }}>{totals.gifts}</strong>
          <div className="muted">presentes cadastrados</div>
        </article>
      </div>

      <SectionShell
        title="Configurações do site"
        subtitle="Ajuste apenas a data, o link do Maps e os avisos públicos."
        sectionKey="settings"
        isOpen={openSections.settings}
        onToggle={toggleSection}
      >
        <div className="grid two">
          <div>
            <label className="label" htmlFor="setting-wedding-date">
              Data e hora do casamento
            </label>
            <input
              id="setting-wedding-date"
              className="input"
              type="datetime-local"
              value={toDateTimeLocalValue(data.settings.weddingDate)}
              onChange={(event) => updateSettingsField("weddingDate", fromDateTimeLocalValue(event.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="setting-church-maps">
              Link do local da cerimônia
            </label>
            <input
              id="setting-church-maps"
              className="input"
              value={data.settings.churchMapsUrl}
              onChange={(event) => updateSettingsField("churchMapsUrl", event.target.value)}
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>
        </div>

        <div className="stack">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h3 className="section-title" style={{ fontSize: "1.45rem" }}>
              Avisos
            </h3>
            <button className="btn btn-secondary" type="button" onClick={addNotice}>
              Adicionar aviso
            </button>
          </div>

          {data.settings.notices.length === 0 ? (
            <p className="muted">Nenhum aviso cadastrado ainda.</p>
          ) : (
            <div className="stack">
              {data.settings.notices.map((notice, index) => (
                <div className="card card-pad notice-editor-item" key={notice.id}>
                  <div className="notice-editor-fields">
                    <div>
                      <label className="label" htmlFor={`notice-title-${notice.id}`}>
                        Título
                      </label>
                      <input
                        id={`notice-title-${notice.id}`}
                        className="input"
                        value={notice.title}
                        onChange={(event) => updateNotice(index, { title: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor={`notice-text-${notice.id}`}>
                        Texto
                      </label>
                      <textarea
                        id={`notice-text-${notice.id}`}
                        className="textarea"
                        value={notice.text}
                        onChange={(event) => updateNotice(index, { text: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="admin-inline-actions">
                    <button className="btn btn-secondary" type="button" onClick={() => moveNotice(index, -1)} disabled={index === 0}>
                      Subir
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => moveNotice(index, 1)}
                      disabled={index === data.settings.notices.length - 1}
                    >
                      Descer
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={() => removeNotice(index)}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-primary" type="button" onClick={saveSettings}>
          {settingsSaveState === "saving" ? "Salvando..." : settingsSaveState === "saved" ? "Salvo ✓" : "Salvar configurações"}
        </button>
        {settingsSaveState === "saved" ? <span className="muted">Configurações salvas.</span> : null}
      </SectionShell>

      <SectionShell
        title="Novo presente"
        subtitle="Adicione itens novos sem precisar sair da tela."
        sectionKey="newGift"
        isOpen={openSections.newGift}
        onToggle={toggleSection}
      >
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
            <label className="label" htmlFor="gift-quantity">
              Quantidade
            </label>
            <input
              id="gift-quantity"
              className="input"
              type="number"
              min={1}
              value={giftDraft.quantity}
              onChange={(event) =>
                setGiftDraft((current) => ({ ...current, quantity: Number(event.target.value) || 1 }))
              }
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
                setGiftDraft((current) => ({ ...current, sortOrder: Number(event.target.value) || 1 }))
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
          {newGiftSaveState === "saving" ? "Salvando..." : newGiftSaveState === "saved" ? "Salvo ✓" : "Salvar presente"}
        </button>
        {newGiftSaveState === "saved" ? <span className="muted">Presente salvo.</span> : null}
      </SectionShell>

      <SectionShell
        title="Presentes cadastrados"
        subtitle="Pesquise, edite e salve cada item individualmente."
        sectionKey="gifts"
        isOpen={openSections.gifts}
        onToggle={toggleSection}
      >
        <div>
          <label className="label" htmlFor="gift-search">
            Pesquisar presente
          </label>
          <input
            id="gift-search"
            className="input"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome, descrição ou quantidade"
          />
        </div>

        <div className="stack">
          {filteredGifts.length === 0 ? (
            <p className="muted">Nenhum presente encontrado para essa busca.</p>
          ) : (
            filteredGifts.map((gift) => {
              const draft = giftEdits[gift.id];
              return (
                <div key={gift.id} className="card card-pad stack">
                  <div className="grid two" style={{ alignItems: "end" }}>
                    <div>
                      <label className="label">Nome</label>
                      <input
                        className="input"
                        value={draft?.name ?? gift.name}
                        onChange={(event) => updateGiftDraft(gift.id, { name: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Quantidade</label>
                      <input
                        className="input"
                        type="number"
                        min={1}
                        value={draft?.quantity ?? gift.quantity}
                        onChange={(event) => updateGiftDraft(gift.id, { quantity: Number(event.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <label className="label">Ordem</label>
                      <input
                        className="input"
                        type="number"
                        value={draft?.sortOrder ?? gift.sortOrder}
                        onChange={(event) => updateGiftDraft(gift.id, { sortOrder: Number(event.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <label className="label">Imagem</label>
                      <input
                        className="input"
                        value={draft?.imagePath ?? gift.imagePath}
                        onChange={(event) => updateGiftDraft(gift.id, { imagePath: event.target.value })}
                      />
                      <input
                        className="input"
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const imagePath = await uploadGiftImage(file, gift.id);
                          updateGiftDraft(gift.id, { imagePath });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Descrição</label>
                    <textarea
                      className="textarea"
                      value={draft?.description ?? gift.description}
                      onChange={(event) => updateGiftDraft(gift.id, { description: event.target.value })}
                    />
                  </div>
                  <div className="admin-inline-actions">
                    <button className="btn btn-primary" type="button" onClick={() => saveGiftChanges(gift.id)}>
                      {giftSaveStates[gift.id] === "saving"
                        ? "Salvando..."
                        : giftSaveStates[gift.id] === "saved"
                          ? "Salvo ✓"
                          : "Salvar alterações"}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={() => archiveGift(gift.id)}>
                      Excluir
                    </button>
                    {giftSaveStates[gift.id] === "saved" ? <span className="muted">Alterações salvas.</span> : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionShell>

      <SectionShell
        title="Presentes já escolhidos"
        subtitle="O nome do convidado aparece apenas para organização dos noivos."
        sectionKey="reservations"
        isOpen={openSections.reservations}
        onToggle={toggleSection}
      >
        {reservationsView.length === 0 ? (
          <p className="muted">Ainda não há presentes reservados.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Presente</th>
                  <th>Quantidade</th>
                  <th>Reservado por</th>
                  <th>Link privado</th>
                  <th>Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {reservationsView.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>
                      <div className="admin-table-gift">
                        <img src={reservation.giftImage} alt={reservation.giftName} />
                        <span>{reservation.giftName}</span>
                      </div>
                    </td>
                    <td>{reservation.quantity} unidade(s)</td>
                    <td>{reservation.guestName || "Nome não informado"}</td>
                    <td>
                      {reservation.accessToken ? (
                        <div className="admin-link-cell">
                          <input
                            className="input admin-link-input"
                            readOnly
                            value={buildPrivateAccessLink(reservation.accessToken)}
                          />
                          <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={() => void copyPrivateAccessLink(reservation.accessToken)}
                          >
                            Copiar
                          </button>
                        </div>
                      ) : (
                        <span className="muted">Sem link salvo</span>
                      )}
                    </td>
                    <td>{reservation.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionShell>

      <SectionShell
        title="Respostas RSVP"
        subtitle="Você pode filtrar, revisar e excluir entradas de teste."
        sectionKey="rsvp"
        isOpen={openSections.rsvp}
        onToggle={toggleSection}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className={`btn ${showConfirmedOnly ? "btn-secondary" : "btn-primary"}`}
              type="button"
              onClick={() => setShowConfirmedOnly(false)}
            >
              Todos
            </button>
            <button
              className={`btn ${showConfirmedOnly ? "btn-primary" : "btn-secondary"}`}
              type="button"
              onClick={() => setShowConfirmedOnly(true)}
            >
              Confirmados
            </button>
          </div>
        </div>

        {visibleRsvp.length === 0 ? (
          <p className="muted">Nenhuma confirmação encontrada para o filtro atual.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Pessoas</th>
                  <th>Resposta</th>
                  <th>Atualizado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {visibleRsvp.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.name}</td>
                    <td>{entry.guestCount}</td>
                    <td>{entry.willAttend ? "Sim" : "Não"}</td>
                    <td>{entry.updatedAt}</td>
                    <td>
                      <button className="btn btn-secondary" type="button" onClick={() => deleteRsvp(entry.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionShell>

      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
