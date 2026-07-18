"use client";

import { useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit() {
    setMessage("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Nao foi possivel entrar.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="card card-pad stack" style={{ maxWidth: 520, margin: "80px auto" }}>
      <span className="eyebrow" style={{ width: "fit-content" }}>
        Área administrativa
      </span>
      <h1 className="section-title">Entrar no painel</h1>
      <p className="muted" style={{ lineHeight: 1.7, marginTop: 0 }}>
        Use a senha definida em variável de ambiente para administrar o RSVP, os presentes e as configurações do site.
      </p>

      <div>
        <label className="label" htmlFor="admin-password">
          Senha
        </label>
        <input
          id="admin-password"
          className="input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <button className="btn btn-primary" type="button" onClick={submit}>
        Entrar
      </button>

      {message ? <p style={{ margin: 0, color: "var(--color-wine)" }}>{message}</p> : null}
    </div>
  );
}
