"use client";

import { useState, useEffect } from "react";

interface PatientInfo {
  id: number;
  name: string;
  noShowZaehler: number;
  sperrstatus: string;
  patientCode: string;
}

interface TerminItem {
  id: number;
  datum: string;
  startzeit: string;
  status: string;
  patient: PatientInfo;
  terminart: { name: string };
}

interface SperreItem {
  id: number;
  patient: { id: number; name: string; noShowZaehler: number };
}

export default function NoShowVerwaltungPage() {
  const [termine, setTermine] = useState<TerminItem[]>([]);
  const [sperren, setSperren] = useState<SperreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [erfolg, setErfolg] = useState("");
  const [mfaId, setMfaId] = useState(1);
  const [protokoll, setProtokoll] = useState<any[]>([]);
  const [zeigeProtokoll, setZeigeProtokoll] = useState(false);

  async function laden() {
    setLoading(true);
    try {
      const res = await fetch("/api/termine/no-show-liste");
      const data = await res.json();
      setTermine(data.termine || []);
      setSperren(data.sperren || []);
    } catch {
      setError("Fehler beim Laden");
    }
    setLoading(false);
  }

  async function protokollLaden() {
    setZeigeProtokoll(!zeigeProtokoll);
    if (!zeigeProtokoll) {
      const res = await fetch("/api/no-show-protokoll");
      const data = await res.json();
      setProtokoll(data.ereignisse || []);
    }
  }

  useEffect(() => { laden(); }, []);

  async function alsNoShow(id: number) {
    setError("");
    setErfolg("");
    try {
      const res = await fetch(`/api/termine/${id}/no-show`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaId }),
      });
      const data = await res.json();
      if (res.ok) {
        setErfolg(`No-Show erfasst! Zähler: ${data.noShowZaehler}, Status: ${data.sperrstatus}`);
        laden();
      } else {
        setError(data.error || "Fehler");
      }
    } catch {
      setError("Fehler");
    }
  }

  async function sperreAufheben(sperreId: number) {
    setError("");
    setErfolg("");
    try {
      const res = await fetch(`/api/patientensperre/${sperreId}/aufheben`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaId }),
      });
      const data = await res.json();
      if (res.ok) {
        setErfolg("Sperre aufgehoben");
        laden();
      } else {
        setError(data.error || "Fehler");
      }
    } catch {
      setError("Fehler");
    }
  }

  return (
    <main>
      <h1>No-Show-Verwaltung</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Nur für MFAs
      </p>

      <section style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: 600 }}>MFA: </label>
        <select value={mfaId} onChange={(e) => setMfaId(parseInt(e.target.value))} style={{ padding: "0.25rem", marginLeft: "0.5rem" }}>
          <option value={1}>Leitende MFA</option>
          <option value={2}>MFA 2</option>
          <option value={3}>MFA 3</option>
          <option value={4}>MFA 4</option>
        </select>
        <button onClick={laden} style={{ marginLeft: "1rem", padding: "0.25rem 0.75rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Aktualisieren
        </button>
        <button onClick={protokollLaden} style={{ marginLeft: "0.5rem", padding: "0.25rem 0.75rem", background: "var(--gray)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          {zeigeProtokoll ? "Protokoll ausblenden" : "Protokoll anzeigen"}
        </button>
      </section>

      {erfolg && <p style={{ color: "var(--primary-dark)", marginBottom: "0.75rem", padding: "0.5rem", background: "var(--primary-bg)", borderRadius: "4px" }}>{erfolg}</p>}
      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "0.75rem" }}>{error}</p>}

      {/* Aktive Sperren */}
      {sperren.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "var(--accent-dark)" }}>Aktive Online-Sperren</h2>
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
            {sperren.map((s) => (
              <div key={s.id} style={{ padding: "0.75rem", border: "2px solid var(--accent)", borderRadius: "4px", background: "#FFF3E8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><strong>{s.patient.name}</strong> &middot; {s.patient.noShowZaehler} No-Shows</span>
                {mfaId <= 1 && (
                  <button onClick={() => sperreAufheben(s.id)} style={{ padding: "0.4rem 0.75rem", background: "var(--accent)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Sperre aufheben
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vergangene Termine (potenzielle No-Shows) */}
      <section>
        <h2>Vergangene Termine</h2>
        {loading ? <p>Lade...</p> : (
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
            {termine.length === 0 && <p style={{ color: "var(--gray-light)" }}>Keine Termine zum Bearbeiten.</p>}
            {termine.map((t) => (
              <div key={t.id} style={{ padding: "0.75rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", background: "var(--white)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{t.patient.name}</strong> ({t.patient.patientCode})<br />
                  <span style={{ fontSize: "0.85rem", color: "var(--gray-light)" }}>
                    {new Date(t.datum).toLocaleDateString("de-DE")} {t.startzeit} &middot; {t.terminart.name} &middot; No-Show-Zähler: {t.patient.noShowZaehler}
                  </span>
                </div>
                <button onClick={() => alsNoShow(t.id)} style={btnStyle}>
                  Als No-Show markieren
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Protokoll */}
      {zeigeProtokoll && (
        <section style={{ marginTop: "2rem" }}>
          <h2>No-Show-Protokoll</h2>
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
            {protokoll.map((e: any, i: number) => (
              <div key={i} style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", fontSize: "0.9rem" }}>
                <strong>{e.patient.name}</strong> ({e.patient.patientCode}) &middot;
                {new Date(e.termin.datum).toLocaleDateString("de-DE")} {e.termin.startzeit} &middot;
                {e.termin.terminart.name} &middot; erfasst am {new Date(e.erfasstAm).toLocaleString("de-DE")}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "0.4rem 0.75rem", background: "var(--accent-dark)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem",
};
