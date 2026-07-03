"use client";

import { useState, useEffect } from "react";

export default function OptInPage() {
  const [patientCode, setPatientCode] = useState("");
  const [isIdentified, setIsIdentified] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [erfolg, setErfolg] = useState("");

  useEffect(() => {
    const code = sessionStorage.getItem("patientCode");
    const name = sessionStorage.getItem("patientName");
    if (code && name) {
      setPatientCode(code);
      setName(name);
      laden(code);
    }
  }, []);

  async function laden(code?: string) {
    const c = code || patientCode;
    if (!c) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/patient/opt-in?patientCode=${c}`);
      const data = await res.json();
      if (res.ok) {
        setName(data.patient.name);
        setEmail(data.patient.email || "");
        setSmsOptIn(data.patient.smsOptIn);
        setEmailOptIn(data.patient.emailOptIn);
        setIsIdentified(true);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Fehler beim Laden");
    }
    setLoading(false);
  }

  async function speichern() {
    setLoading(true);
    setError("");
    setErfolg("");
    try {
      const res = await fetch("/api/patient/opt-in", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientCode, smsOptIn, emailOptIn, email: email || undefined }),
      });
      if (res.ok) {
        setErfolg("Einstellungen gespeichert!");
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch {
      setError("Fehler beim Speichern");
    }
    setLoading(false);
  }

  if (!isIdentified) {
    return (
      <main>
        <h1>Kommunikationseinstellungen</h1>
        <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
          Bitte geben Sie Ihren Patient-Code ein.
        </p>
        <section style={{ display: "flex", gap: "0.5rem" }}>
          <input value={patientCode} onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
            placeholder="Patient-Code" style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "250px" }} />
          <button onClick={() => laden()} disabled={!patientCode} style={btnStyle}>Laden</button>
        </section>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "500px" }}>
      <h1>Kommunikationseinstellungen</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        {name} — Verwalten Sie, wie wir Sie kontaktieren dürfen.
      </p>

      {erfolg && <p style={{ color: "var(--primary-dark)", marginBottom: "1rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "4px" }}>{erfolg}</p>}
      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", cursor: "pointer" }}>
          <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} style={{ width: "1.25rem", height: "1.25rem" }} />
          <div>
            <strong>SMS-Benachrichtigungen</strong>
            <p style={{ fontSize: "0.85rem", color: "var(--gray-light)", margin: 0 }}>Terminerinnerungen und Rezept-Benachrichtigungen per SMS</p>
          </div>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", cursor: "pointer" }}>
          <input type="checkbox" checked={emailOptIn} onChange={(e) => setEmailOptIn(e.target.checked)} style={{ width: "1.25rem", height: "1.25rem" }} />
          <div>
            <strong>E-Mail-Benachrichtigungen</strong>
            <p style={{ fontSize: "0.85rem", color: "var(--gray-light)", margin: 0 }}>Terminerinnerungen und Rezept-Benachrichtigungen per E-Mail</p>
          </div>
        </label>

        {emailOptIn && (
          <input type="email" placeholder="E-Mail-Adresse" value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "100%" }} />
        )}

        <button onClick={speichern} disabled={loading} style={{
          padding: "0.75rem 1.5rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "1rem",
        }}>
          {loading ? "Speichere..." : "Einstellungen speichern"}
        </button>
      </div>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer",
};
