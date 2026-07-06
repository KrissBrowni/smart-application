"use client";

import { useState, useEffect } from "react";

export default function WartelisteVerwaltungPage() {
  const [eintraege, setEintraege] = useState<any[]>([]);
  const [heuteAbgesagt, setHeuteAbgesagt] = useState(0);
  const [loading, setLoading] = useState(true);

  async function laden() {
    setLoading(true);
    const res = await fetch("/api/warteliste/check");
    const d = await res.json();
    setEintraege(d.eintraege || []);
    setHeuteAbgesagt(d.heuteAbgesagt || 0);
    setLoading(false);
  }

  useEffect(() => { laden(); }, []);

  async function entfernen(id: number) {
    await fetch(`/api/warteliste/${id}`, { method: "DELETE" });
    laden();
  }

  return (
    <main>
      <h1>Wartelisten-Verwaltung</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Nur für MFAs
      </p>

      <div style={{ marginBottom: "1rem", padding: "0.75rem", background: heuteAbgesagt > 0 ? "var(--primary-bg)" : "transparent", borderRadius: "4px" }}>
        <strong>{heuteAbgesagt} Termin(e)</strong> heute abgesagt{heuteAbgesagt > 0 && " — Warteliste prüfen!"}
        <button onClick={laden} style={{ marginLeft: "1rem", padding: "0.3rem 0.6rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Aktualisieren
        </button>
      </div>

      {loading && <p>Lade...</p>}
      {!loading && eintraege.length === 0 && <p style={{ color: "var(--gray-light)" }}>Keine wartenden Patienten.</p>}

      <div style={{ display: "grid", gap: "0.5rem" }}>
        {eintraege.map((e: any) => (
          <div key={e.id} style={{ padding: "0.75rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", background: "var(--white)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <strong>{e.patient.name}</strong> ({e.patient.patientCode}) · Tel: {e.patient.telefonnummer}<br />
                <span style={{ fontSize: "0.85rem", color: "var(--gray-light)" }}>
                  Möchte: <strong>{e.terminart.name}</strong> · {new Date(e.startDatum).toLocaleDateString("de-DE")} – {new Date(e.endDatum).toLocaleDateString("de-DE")} · {e.fruehzeit}–{e.spaetzeit} · Wartet seit {new Date(e.erstelltAm).toLocaleDateString("de-DE")}
                </span>
              </div>
              <button onClick={() => entfernen(e.id)} style={{ padding: "0.3rem 0.6rem", background: "var(--gray)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                Erledigt
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
