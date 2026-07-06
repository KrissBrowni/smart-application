"use client";

import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function laden() {
    setLoading(true);
    const res = await fetch("/api/mfa/dashboard");
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  useEffect(() => { laden(); }, []);

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: "var(--gray-light)" }}>
            Praxis Demir & Kollegen — Nur für MFAs · {data?.datum ? new Date(data.datum + "T00:00:00Z").toLocaleDateString("de-DE") : ""}
          </p>
        </div>
        <button onClick={laden} disabled={loading} style={{ padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          {loading ? "Lade..." : "Aktualisieren"}
        </button>
      </div>

      {loading && <p>Lade...</p>}

      {data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
            <Kachel titel="Termine heute" wert={data.kacheln.termineHeute} farbe="var(--primary)" />
            <Kachel titel="Offene Rezepte" wert={data.kacheln.offeneRezepte} farbe="var(--accent)" />
            <Kachel titel="Freie Akutslots" wert={data.kacheln.freieAkutslots} warn={data.kacheln.freieAkutslots === 0} />
            <Kachel titel="Warteliste" wert={data.kacheln.warteliste} warn={data.kacheln.warteliste > 0} />
            <Kachel titel="No-Shows diese Woche" wert={data.kacheln.noShowDieseWoche} warn={data.kacheln.noShowDieseWoche > 3} />
            <Kachel titel="Aktive Sperren" wert={data.kacheln.aktiveSperren} warn={data.kacheln.aktiveSperren > 0} />
          </div>

          <section style={{ marginTop: "2rem" }}>
            <h2>Heutige Termine ({data.termine?.length || 0})</h2>
            <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
              {data.termine?.length === 0 && <p style={{ color: "var(--gray-light)" }}>Keine Termine heute.</p>}
              {data.termine?.map((t: any) => (
                <div key={t.id} style={{ padding: "0.75rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", background: "var(--white)", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>{t.startzeit}–{t.endzeit}</strong> &middot; {t.patient.name}
                  </div>
                  <div style={{ color: "var(--gray-light)", fontSize: "0.9rem" }}>
                    {t.terminart.name} &middot; {t.arzt?.name || "Kein Arzt"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Kachel({ titel, wert, farbe, warn }: { titel: string; wert: number; farbe?: string; warn?: boolean }) {
  if (warn) farbe = "var(--accent-dark)";
  return (
    <div style={{
      padding: "1.25rem", border: `1px solid ${farbe || "var(--gray-meta)"}`, borderRadius: "8px",
      background: farbe ? `${farbe}10` : "var(--white)",
      textAlign: "center",
    }}>
      <p style={{ fontSize: "2.5rem", fontWeight: 700, color: farbe || "var(--ink)" }}>{wert}</p>
      <p style={{ color: "var(--gray-light)", fontSize: "0.9rem" }}>{titel}</p>
    </div>
  );
}
