"use client";

import { useState, useEffect } from "react";

interface Kennzahlen {
  termineGesamt: number;
  termineProTag: string;
  onlineBuchungsquote: string;
  noShowRate: string;
  noShowProArzt: Record<string, number>;
  offeneRezeptanfragen: number;
  akutslotAuslastung: string;
  akutSlotsGesamt: number;
  akutSlotsBelegt: number;
}

interface Uebersicht {
  kw: number;
  jahr: number;
  zeitraum: string;
  kennzahlen: Kennzahlen;
}

function getKW(d: Date): { kw: number; jahr: number } {
  const firstJan = new Date(d.getFullYear(), 0, 1);
  const dayOffset = Math.floor((d.getTime() - firstJan.getTime()) / 86400000);
  const kw = Math.ceil((dayOffset + firstJan.getDay() + 1) / 7);
  return { kw, jahr: d.getFullYear() };
}

export default function WochenuebersichtPage() {
  const heute = new Date();
  const { kw: aktuelleKW, jahr: aktuellesJahr } = getKW(heute);
  const [kw, setKw] = useState(aktuelleKW);
  const [jahr, setJahr] = useState(aktuellesJahr);
  const [data, setData] = useState<Uebersicht | null>(null);
  const [loading, setLoading] = useState(true);

  async function laden(kwVal: number, jahrVal: number) {
    setLoading(true);
    const res = await fetch(`/api/wochenuebersicht?kw=${kwVal}&jahr=${jahrVal}`);
    const d = await res.json();
    if (d.kennzahlen) setData(d);
    setLoading(false);
  }

  useEffect(() => { laden(kw, jahr); }, []);

  function navigate(delta: number) {
    let neueKW = kw + delta;
    let neuesJahr = jahr;
    if (neueKW < 1) { neueKW = 52; neuesJahr--; }
    if (neueKW > 52) { neueKW = 1; neuesJahr++; }
    setKw(neueKW);
    setJahr(neuesJahr);
    laden(neueKW, neuesJahr);
  }

  return (
    <main>
      <h1>Wochenübersicht</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Kennzahlen auf einen Blick
      </p>

      <section style={{ marginBottom: "1.5rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button onClick={() => navigate(-1)} style={navBtn}>&larr; Vorwoche</button>
        <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
          KW {kw} / {jahr}
        </div>
        <button onClick={() => navigate(1)} style={navBtn}>Folgewoche &rarr;</button>
        <button onClick={() => { setKw(aktuelleKW); setJahr(aktuellesJahr); laden(aktuelleKW, aktuellesJahr); }}
          style={{ ...navBtn, background: "var(--gray)" }}>
          Heute
        </button>
      </section>

      {loading && <p>Lade...</p>}

      {data && (
        <>
          <p style={{ color: "var(--gray-light)", marginBottom: "1rem" }}>
            {data.zeitraum}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
            <Karte titel="Termine gesamt" wert={data.kennzahlen.termineGesamt.toString()} subtext={`${data.kennzahlen.termineProTag} pro Tag`} />
            <Karte titel="Online-Buchungsquote" wert={`${data.kennzahlen.onlineBuchungsquote}%`} farbe="var(--primary)" />
            <Karte titel="No-Show-Rate" wert={`${data.kennzahlen.noShowRate}%`}
              farbe={parseFloat(data.kennzahlen.noShowRate) > 5 ? "var(--accent-dark)" : "var(--gray)"} />
            <Karte titel="Offene Rezeptanfragen" wert={data.kennzahlen.offeneRezeptanfragen.toString()} farbe="var(--accent)" />
            <Karte titel="Akutslot-Auslastung" wert={`${data.kennzahlen.akutslotAuslastung}%`}
              subtext={`${data.kennzahlen.akutSlotsBelegt}/${data.kennzahlen.akutSlotsGesamt} belegt`} />
          </div>

          {Object.keys(data.kennzahlen.noShowProArzt).length > 0 && (
            <section style={{ marginTop: "2rem" }}>
              <h2>No-Shows pro Ärzt:in</h2>
              <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem", maxWidth: "400px" }}>
                {Object.entries(data.kennzahlen.noShowProArzt).map(([name, count]) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px" }}>
                    <span>{name}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function Karte({ titel, wert, subtext, farbe }: { titel: string; wert: string; subtext?: string; farbe?: string }) {
  return (
    <div style={{ padding: "1.25rem", border: `1px solid ${farbe || "var(--gray-meta)"}`, borderRadius: "8px", background: farbe ? `${farbe}10` : "var(--white)" }}>
      <p style={{ color: "var(--gray-light)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>{titel}</p>
      <p style={{ fontSize: "2rem", fontWeight: 700, color: farbe || "var(--ink)" }}>{wert}</p>
      {subtext && <p style={{ color: "var(--gray-meta)", fontSize: "0.85rem", marginTop: "0.25rem" }}>{subtext}</p>}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600,
};
