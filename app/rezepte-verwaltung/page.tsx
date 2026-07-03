"use client";

import { useState, useEffect } from "react";

interface Anfrage {
  id: number;
  patient: { id: number; name: string; geburtsdatum: string };
  medikamentReferenz: string;
  status: string;
  angefragtAm: string;
  ablehnungsgrund: string | null;
  bearbeiter: { id: number; name: string } | null;
  freigeber: { id: number; name: string } | null;
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    eingegangen: "Eingegangen",
    in_bearbeitung: "In Bearbeitung",
    freigegeben: "Freigegeben",
    abgelehnt: "Abgelehnt",
    benachrichtigt: "Benachrichtigt",
  };
  return map[s] || s;
}

export default function RezepteVerwaltungPage() {
  const [anfragen, setAnfragen] = useState<Anfrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function laden() {
    setLoading(true);
    try {
      const res = await fetch("/api/rezepte");
      const data = await res.json();
      setAnfragen(data.anfragen || []);
    } catch {
      setError("Fehler beim Laden");
    }
    setLoading(false);
  }

  useEffect(() => { laden(); }, []);

  async function freigeben(id: number) {
    try {
      const res = await fetch(`/api/rezepte/${id}/freigeben`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arztId: 1 }),
      });
      if (res.ok) {
        setError("");
        laden();
      } else {
        const data = await res.json();
        setError(data.error || "Fehler bei Freigabe");
      }
    } catch {
      setError("Fehler bei Freigabe");
    }
  }

  async function ablehnen(id: number) {
    const grund = prompt("Ablehnungsgrund:");
    if (!grund) return;
    try {
      const res = await fetch(`/api/rezepte/${id}/freigeben`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arztId: 1, ablehnungsgrund: grund }),
      });
      if (res.ok) {
        setError("");
        laden();
      } else {
        const data = await res.json();
        setError(data.error || "Fehler");
      }
    } catch {
      setError("Fehler");
    }
  }

  return (
    <main>
      <h1>Rezeptverwaltung</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Übersicht aller Rezeptanfragen
      </p>

      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <button onClick={laden} disabled={loading} style={{
        padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "1rem",
      }}>
        {loading ? "Lade..." : "Aktualisieren"}
      </button>

      {anfragen.length === 0 && !loading && <p style={{ color: "var(--gray-light)" }}>Keine Rezeptanfragen vorhanden.</p>}

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {anfragen.map((a) => (
          <div key={a.id} style={{
            padding: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", background: "var(--white)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <strong>{a.patient.name}</strong> &middot; {a.medikamentReferenz}
                <br />
                <span style={{ color: "var(--gray-light)", fontSize: "0.9rem" }}>
                  Status: <strong>{statusLabel(a.status)}</strong> &middot; {new Date(a.angefragtAm).toLocaleDateString("de-DE")}
                </span>
                {a.freigeber && <span style={{ color: "var(--gray-light)", fontSize: "0.9rem" }}> &middot; Freigegeben von {a.freigeber.name}</span>}
                {a.ablehnungsgrund && <span style={{ color: "var(--accent-dark)", fontSize: "0.9rem" }}> &middot; Grund: {a.ablehnungsgrund}</span>}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {a.status === "eingegangen" && (
                  <>
                    <button onClick={() => freigeben(a.id)} style={btnStyle}>Freigeben</button>
                    <button onClick={() => ablehnen(a.id)} style={{ ...btnStyle, background: "var(--accent-dark)" }}>Ablehnen</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "0.4rem 0.75rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem",
};
