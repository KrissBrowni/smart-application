"use client";

import { useState, useEffect } from "react";

interface BriefVorlage {
  patient: { name: string; patientCode: string; noShowZaehler: number; sperrstatus: string };
  noShows: { datum: string; startzeit: string; terminart: string; erfasstAm: string }[];
  gesperrt: boolean;
}

export default function NoShowBriefePage() {
  const [patientCode, setPatientCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [erfolg, setErfolg] = useState("");
  const [brief, setBrief] = useState<BriefVorlage | null>(null);
  const [briefe, setBriefe] = useState<any[]>([]);
  const [zeigeHistorie, setZeigeHistorie] = useState(false);

  async function generieren() {
    if (!patientCode) return;
    setLoading(true);
    setError("");
    setBrief(null);
    try {
      const res = await fetch("/api/no-show-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientCode }),
      });
      const d = await res.json();
      if (res.ok) {
        setBrief(d.brief);
        setErfolg("Brief generiert!");
      } else {
        setError(d.error || "Fehler");
      }
    } catch {
      setError("Fehler");
    }
    setLoading(false);
  }

  async function historieLaden() {
    setZeigeHistorie(!zeigeHistorie);
    if (!zeigeHistorie) {
      const res = await fetch(`/api/no-show-brief?patientCode=${patientCode}`);
      const d = await res.json();
      setBriefe(d.briefe || []);
    }
  }

  return (
    <main>
      <h1>No-Show-Brief-Vorlagen</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Nur für MFAs
      </p>

      {erfolg && <p style={{ color: "var(--primary-dark)", marginBottom: "1rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "4px" }}>{erfolg}</p>}
      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <section style={{ maxWidth: "500px", marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
        <input value={patientCode} onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
          placeholder="Patient-Code" style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", flex: 1 }} />
        <button onClick={generieren} disabled={!patientCode || loading} style={btnStyle}>
          {loading ? "Generiere..." : "Brief generieren"}
        </button>
        <button onClick={historieLaden} style={{ ...btnStyle, background: "var(--gray)" }}>
          Historie
        </button>
      </section>

      {/* Generierte Briefvorlage */}
      {brief && (
        <section style={{ maxWidth: "600px", marginBottom: "2rem", padding: "1.5rem", border: "1px solid var(--gray-meta)", borderRadius: "8px", background: "var(--white)" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>No-Show-Brief</h2>

          <p style={{ marginBottom: "1rem" }}>
            <strong>Praxis Demir & Kollegen</strong><br />
            <span style={{ color: "var(--gray-light)", fontSize: "0.9rem" }}>Berlin, {new Date().toLocaleDateString("de-DE")}</span>
          </p>

          <p style={{ marginBottom: "1rem" }}>
            <strong>Betrifft: {brief.patient.name} (Code: {brief.patient.patientCode})</strong>
          </p>

          <p style={{ marginBottom: "1rem" }}>
            Sehr geehrte/r Patient/in {brief.patient.name},
          </p>

          <p style={{ marginBottom: "0.75rem" }}>
            Sie haben in letzter Zeit mehrfach Termine in unserer Praxis nicht wahrgenommen, ohne rechtzeitig abzusagen:
          </p>

          <ul style={{ marginBottom: "1rem", paddingLeft: "1.25rem" }}>
            {brief.noShows.map((n, i) => (
              <li key={i} style={{ marginBottom: "0.25rem" }}>
                {n.datum} um {n.startzeit} Uhr ({n.terminart})
              </li>
            ))}
          </ul>

          {brief.gesperrt ? (
            <p style={{ marginBottom: "1rem", color: "var(--accent-dark)", fontWeight: 600 }}>
              Ihr Online-Buchungszugang wurde aufgrund der Häufung von No-Shows gesperrt.
              Bitte kontaktieren Sie uns telefonisch, um die Sperre aufheben zu lassen.
            </p>
          ) : (
            <p style={{ marginBottom: "1rem" }}>
              Bitte denken Sie daran, Termine rechtzeitig abzusagen, falls Sie nicht kommen können.
              Bei drei unentschuldigten No-Shows wird Ihr Online-Buchungszugang gesperrt.
            </p>
          )}

          <p style={{ marginTop: "1.5rem" }}>
            Mit freundlichen Grüßen,<br />
            <strong>Ihr Praxisteam Demir & Kollegen</strong>
          </p>
        </section>
      )}

      {/* Historie */}
      {zeigeHistorie && (
        <section>
          <h2>Versendete Briefe</h2>
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
            {briefe.length === 0 && <p style={{ color: "var(--gray-light)" }}>Keine Briefe gefunden.</p>}
            {briefe.map((b: any) => (
              <div key={b.id} style={{ padding: "0.75rem", border: "1px solid var(--gray-meta)", borderRadius: "4px" }}>
                <strong>{b.patient.name}</strong> ({b.patient.patientCode}) · {new Date(b.erstelltAm).toLocaleDateString("de-DE")} · Status: {b.status}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer",
};
