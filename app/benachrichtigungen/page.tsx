"use client";

import { useState, useEffect } from "react";

interface Benachrichtigung {
  id: number;
  typ: string;
  kanal: string;
  status: string;
  bezugstyp: string;
  erstelltAm: string;
  versendetAm: string | null;
}

function typLabel(t: string): string {
  const map: Record<string, string> = {
    erinnerung: "Termin-Erinnerung",
    absage: "Terminabsage",
    rezept_bereit: "Rezept bereit",
    no_show_warnung: "No-Show-Warnung",
  };
  return map[t] || t;
}

function statusBadge(s: string): string {
  const map: Record<string, string> = {
    geplant: "var(--accent)",
    versendet: "var(--primary)",
    zugestellt: "var(--primary-dark)",
    fehlgeschlagen: "var(--accent-dark)",
    nicht_erlaubt: "var(--gray-meta)",
  };
  return map[s] || "var(--gray)";
}

export default function BenachrichtigungenPage() {
  const [patientCode, setPatientCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Benachrichtigung[]>([]);

  useEffect(() => {
    const code = sessionStorage.getItem("patientCode");
    if (code) {
      setPatientCode(code);
      suchen(code);
    }
  }, []);

  async function suchen(code?: string) {
    const c = code || patientCode;
    if (!c) return;
    setLoading(true);
    const res = await fetch(`/api/benachrichtigungen?patientCode=${c}`);
    const d = await res.json();
    setData(d.benachrichtigungen || []);
    setLoading(false);
  }

  return (
    <main>
      <h1>Ihre Benachrichtigungen</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen
      </p>

      <section style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        <input value={patientCode} onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
          placeholder="Patient-Code" style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px" }} />
        <button onClick={() => suchen()} disabled={!patientCode} style={{ padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Suchen
        </button>
      </section>

      {loading && <p>Lade...</p>}

      {data.length === 0 && !loading && (
        <p style={{ color: "var(--gray-light)" }}>
          Keine Benachrichtigungen gefunden. {!patientCode && "Bitte geben Sie Ihren Patient-Code ein."}
        </p>
      )}

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {data.map((b) => (
          <div key={b.id} style={{ padding: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", background: "var(--white)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <strong>{typLabel(b.typ)}</strong> &middot; über {b.kanal}<br />
                <span style={{ color: "var(--gray-light)", fontSize: "0.85rem" }}>
                  {new Date(b.erstelltAm).toLocaleDateString("de-DE")}
                  {b.versendetAm && ` · Versendet: ${new Date(b.versendetAm).toLocaleString("de-DE")}`}
                </span>
              </div>
              <span style={{ padding: "0.2rem 0.5rem", background: statusBadge(b.status), color: "white", borderRadius: "4px", fontSize: "0.8rem" }}>
                {b.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
