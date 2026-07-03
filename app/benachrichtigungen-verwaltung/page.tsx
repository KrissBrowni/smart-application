"use client";

import { useState, useEffect } from "react";

interface Benachrichtigung {
  id: number;
  patient: { id: number; name: string; patientCode: string };
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

export default function BenachrichtigungenVerwaltungPage() {
  const [data, setData] = useState<Benachrichtigung[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  async function laden() {
    setLoading(true);
    const res = await fetch("/api/benachrichtigungen");
    const d = await res.json();
    setData(d.benachrichtigungen || []);
    setLoading(false);
  }

  useEffect(() => { laden(); }, []);

  async function statusAendern(id: number, status: string) {
    await fetch(`/api/benachrichtigungen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    laden();
  }

  const gefiltert = filter
    ? data.filter((b) => b.status === filter || b.typ === filter || b.patient.name.toLowerCase().includes(filter.toLowerCase()))
    : data;

  return (
    <main>
      <h1>Benachrichtigungsverwaltung</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Nur für MFAs
      </p>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtern (Name, Status, Typ...)" style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "300px" }} />
        <button onClick={laden} style={{ padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Aktualisieren
        </button>
      </div>

      {loading && <p>Lade...</p>}
      {!loading && gefiltert.length === 0 && <p style={{ color: "var(--gray-light)" }}>Keine Benachrichtigungen.</p>}

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {gefiltert.map((b) => (
          <div key={b.id} style={{ padding: "0.75rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", background: "var(--white)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{b.patient.name}</strong> ({b.patient.patientCode})<br />
              <span style={{ fontSize: "0.85rem", color: "var(--gray-light)" }}>
                {typLabel(b.typ)} &middot; {b.kanal} &middot; {new Date(b.erstelltAm).toLocaleString("de-DE")}
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ padding: "0.2rem 0.5rem", background: b.status === "zugestellt" ? "var(--primary-dark)" : "var(--accent)", color: "white", borderRadius: "4px", fontSize: "0.8rem" }}>
                {b.status}
              </span>
              {b.status === "geplant" && (
                <button onClick={() => statusAendern(b.id, "zugestellt")} style={{ padding: "0.3rem 0.6rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                  Als zugestellt markieren
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
