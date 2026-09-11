"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type StatusState = {
  loading: boolean;
  error: string;
  success: string;
};

const initialStatus: StatusState = {
  loading: false,
  error: "",
  success: ""
};

export function PixContributionCard({ pixKey }: { pixKey: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [confirmationId, setConfirmationId] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<StatusState>(initialStatus);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  function toggleForm() {
    setStatus(initialStatus);
    setIsExpanded((current) => !current);
  }

  function openPixPanel() {
    if (!guestName.trim()) {
      setStatus({ loading: false, error: "Informe seu nome para continuar.", success: "" });
      return;
    }

    if (!pixKey.trim()) {
      setStatus({
        loading: false,
        error: "A chave PIX ainda não foi configurada pelos noivos.",
        success: ""
      });
      return;
    }

    setConfirmationId(crypto.randomUUID());
    setCopied(false);
    setStatus(initialStatus);
    setIsModalOpen(true);
  }

  function cancelPix() {
    setIsModalOpen(false);
    setIsExpanded(false);
    setGuestName("");
    setConfirmationId("");
    setCopied(false);
    setStatus(initialStatus);
  }

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
    } catch {
      setStatus({ loading: false, error: "Não foi possível copiar a chave. Selecione e copie manualmente.", success: "" });
    }
  }

  async function confirmPix() {
    if (!confirmationId || status.loading) return;
    setStatus({ loading: true, error: "", success: "" });

    try {
      const response = await fetch("/api/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: guestName.trim(), confirmationId })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? "Não foi possível registrar sua contribuição.");
      }

      setIsModalOpen(false);
      setIsExpanded(false);
      setGuestName("");
      setConfirmationId("");
      setCopied(false);
      setStatus({
        loading: false,
        error: "",
        success: payload?.message ?? "Sua contribuição via PIX foi registrada. Obrigado!"
      });
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : "Não foi possível registrar sua contribuição.",
        success: ""
      });
    }
  }

  return (
    <>
      <article className="card gift-card pix-card reveal-on-scroll">
        <div className="gift-image-wrap">
          <Image src="/images/pix-contribution.svg" alt="Contribuir com PIX" width={800} height={630} />
        </div>

        <div className="gift-card-body">
          <div className="gift-copy">
            <strong>Contribuir com PIX</strong>
          </div>

          <div className="gift-actions">
            <button
              className="btn btn-primary gift-button"
              type="button"
              aria-expanded={isExpanded}
              onClick={toggleForm}
            >
              Presentear
            </button>

            {isExpanded ? (
              <div className="gift-panel" aria-live="polite">
                <div>
                  <label className="label" htmlFor="pix-guest-name">
                    Seu nome
                  </label>
                  <input
                    id="pix-guest-name"
                    className="input"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder="Como você prefere ser identificado"
                  />
                </div>
                <div className="gift-panel-actions">
                  <button className="btn btn-primary gift-button" type="button" onClick={openPixPanel}>
                    Fazer um PIX
                  </button>
                  <button className="btn btn-secondary gift-button" type="button" onClick={toggleForm}>
                    Fechar
                  </button>
                </div>
              </div>
            ) : null}

            {status.error && !isModalOpen ? <p className="error-message pix-card-message">{status.error}</p> : null}
            {status.success ? <p className="success-message pix-card-message">{status.success}</p> : null}
          </div>
        </div>
      </article>

      {isMounted && isModalOpen
        ? createPortal(
            <div className="gift-modal-overlay" role="presentation">
              <div
                className="gift-modal pix-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pix-modal-title"
                aria-describedby="pix-modal-description"
              >
                <div className="gift-modal-heading">
                  <span className="gift-modal-badge" aria-hidden="true">
                    PIX
                  </span>
                  <div>
                    <span className="eyebrow">Contribuição via PIX</span>
                    <h2 id="pix-modal-title" className="section-title pix-modal-title">
                      Copie a chave PIX
                    </h2>
                  </div>
                </div>

                <p id="pix-modal-description" className="pix-modal-description">
                  Depois de concluir a transferência no aplicativo do seu banco, volte aqui e confirme em “Já fiz o PIX”.
                </p>

                <div className="gift-link-row">
                  <input className="input gift-link-input" readOnly value={pixKey} aria-label="Chave PIX" />
                  <button className="btn btn-secondary" type="button" onClick={() => void copyPixKey()}>
                    {copied ? "Chave copiada ✓" : "Copiar chave"}
                  </button>
                </div>

                {status.error ? <p className="error-message pix-card-message">{status.error}</p> : null}

                <div className="pix-modal-actions">
                  <button className="btn btn-primary" type="button" disabled={status.loading} onClick={() => void confirmPix()}>
                    {status.loading ? "Registrando..." : "Já fiz o PIX"}
                  </button>
                  <button className="btn btn-secondary" type="button" disabled={status.loading} onClick={cancelPix}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
