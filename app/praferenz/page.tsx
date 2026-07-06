"use client";

import { useState, useEffect } from "react";

interface Arzt {
  id: number;
  name: string;
}

export default function PraferenzPage() {
  const [patientCode, setPatientCode] = useState("");
  const [isIdentified, setIsIdentified] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [aerzte, setAerzte] = useState<Arzt[]>([]);
  const [bevorzugterArztId, setBevorzugterArztId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [erfolg, setErfolg] = useState("");

  useEffect(() => {
    const code = sessionStorage.getItem("patientCode");
    if (code) {
      setPatientCode(code);
      laden(code);
    }
  }, []);

  async function laden(code?: string) {
    const c = code || patientCode;
    if (!c) return;
    setLoading(true);
    const res = await fetch(`/api/patient/praferenz?patientCode=${c}`);
    if (res.ok) {
      const d = await res.json();
      setPatientName(d.patient.name);
      setBevorzugterArztId(d.patient.bevorzugterArztId);
      setAerzte(d.aerzte || []);
      setIsIdentified(true);
    } else {
      setError("Patient nicht gefunden");
    }
    setLoading(false);
  }

  async function speichern() {
    setLoading(true);
    setError("");
    setErfolg("");
    try {
      const res = await fetch("/api/patient/praferenz", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientCode, arztId: bevorzugterArztId }),
      });
      if (res.ok) setErfolg("Präferenz gespeichert!");
      else setError("Fehler");
    } catch {
      setError("Fehler");
    }
    setLoading(false);
  }

  if (!isIdentified) {
    return (
      <main>
        <h1>Bevorzugte Ärztin/Arzt wählen</h1>
        <section style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <input value={patientCode} onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
            placeholder="Patient-Code" style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px" }} />
          <button onClick={() => laden()} disabled={!patientCode} style={btnStyle}>Laden</button>
        </section>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "500px" }}>
      <h1>Bevorzugte Ärztin/Arzt</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        {patientName} — Wählen Sie Ihre bevorzugte Ärztin/Ihren bevorzugten Arzt.
        Bei der Terminsuche werden deren Slots zuerst angezeigt.
      </p>

      {erfolg && <p style={{ color: "var(--primary-dark)", marginBottom: "1rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "4px" }}>{erfolg}</p>}
      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label style={{ padding: "0.75rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input type="radio" name="arzt" checked={bevorzugterArztId === null} onChange={() => setBevorzugterArztId(null)} />
          <strong>Keine Präferenz</strong>
        </label>

        {aerzte.map((a) => (
          <label key={a.id} style={{
            padding: "0.75rem", border: `1px solid ${bevorzugterArztId === a.id ? "var(--primary)" : "var(--gray-meta)"}`,
            borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
            background: bevorzugterArztId === a.id ? "var(--primary-bg)" : "transparent",
          }}>
            <input type="radio" name="arzt" checked={bevorzugterArztId === a.id} onChange={() => setBevorzugterArztId(a.id)} />
            <strong>{a.name}</strong>
          </label>
        ))}

        <button onClick={speichern} disabled={loading} style={{
          padding: "0.75rem 1.5rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "1rem",
        }}>
          {loading ? "Speichere..." : "Präferenz speichern"}
        </button>
      </div>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer",
};
