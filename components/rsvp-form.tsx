"use client";

import { useState } from "react";

type FormState = {
  name: string;
  willAttend: boolean | null;
  guestCount: number;
};

const initialState: FormState = {
  name: "",
  willAttend: null,
  guestCount: 1
};

export function RSVPForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: ""
  });

  const update = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));

  async function submit() {
    setStatus({ loading: true, message: "", error: "" });
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível enviar sua resposta.");
      }

      setStatus({
        loading: false,
        message: data.message ?? "Presença confirmada com carinho.",
        error: ""
      });
      setForm(initialState);
    } catch (error) {
      setStatus({
        loading: false,
        message: "",
        error: error instanceof Error ? error.message : "Não foi possível enviar sua resposta."
      });
    }
  }

  return (
    <div className="rsvp-block">
      <button className="btn btn-primary rsvp-trigger" type="button" onClick={() => setIsOpen((current) => !current)}>
        Confirmar presença
      </button>

      {isOpen ? (
        <div className="rsvp-form-panel">
          <p className="privacy-note">
            Seus dados serão usados apenas para a organização do casamento.
          </p>

          <div className="form-grid">
            <div>
              <label className="label" htmlFor="rsvp-name">
                Nome da pessoa
              </label>
              <input
                id="rsvp-name"
                className="input"
                value={form.name}
                onChange={(event) => update({ name: event.target.value })}
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="label" htmlFor="rsvp-guest-count">
                Número de pessoas
              </label>
              <input
                id="rsvp-guest-count"
                className="input"
                type="number"
                min={form.willAttend === false ? 0 : 1}
                step={1}
                value={form.guestCount}
                onChange={(event) => update({ guestCount: Number(event.target.value) })}
              />
            </div>
          </div>

          <div>
            <p className="label">Você irá ao casamento?</p>
            <div className="choice-row">
              <button
                type="button"
                className={`btn ${form.willAttend === true ? "btn-primary" : "btn-secondary"}`}
                onClick={() => update({ willAttend: true, guestCount: Math.max(form.guestCount, 1) })}
              >
                Sim
              </button>
              <button
                type="button"
                className={`btn ${form.willAttend === false ? "btn-primary" : "btn-secondary"}`}
                onClick={() => update({ willAttend: false, guestCount: 0 })}
              >
                Não
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary submit-rsvp"
            onClick={submit}
            disabled={status.loading || !form.name.trim() || form.willAttend === null}
          >
            {status.loading ? "Enviando..." : "Enviar confirmação"}
          </button>

          {status.message ? <p className="success-message">{status.message}</p> : null}
          {status.error ? <p className="error-message">{status.error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
