"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/app/components/loading-spinner";

export default function WartelistePage() {
  const [patientCode, setPatientCode] = useState("");
  const [isIdentified, setIsIdentified] = useState(false);
  const [eintraege, setEintraege] = useState<any[]>([]);
  const [terminarten, setTerminarten] = useState<any[]>([]);
  const [terminartId, setTerminartId] = useState<number>(0);
  const [startDatum, setStartDatum] = useState("");
  const [endDatum, setEndDatum] = useState("");
  const [fruehzeit, setFruehzeit] = useState("08:00");
  const [spaetzeit, setSpaetzeit] = useState("16:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [erfolg, setErfolg] = useState("");

  useEffect(() => {
    const code = sessionStorage.getItem("patientCode");
    if (code) {
      setPatientCode(code);
      setIsIdentified(true);
      laden(code);
    }
    // Terminarten laden
    fetch("/api/termine/verfuegbarkeit?datum=" + new Date().toISOString().split("T")[0])
      .then(r => r.json()).then(d => { if (d.termine) {
        const unique = new Map(d.termine.map((s: any) => [s.terminartId, { id: s.terminartId, name: s.terminartName }]));
        setTerminarten(Array.from(unique.values()));
      }}).catch(() => {});
  }, []);

  async function laden(code?: string) {
    const c = code || patientCode;
    if (!c) return;
    const res = await fetch(`/api/warteliste?patientCode=${c}`);
    const d = await res.json();
    setEintraege(d.eintraege || []);
  }

  async function eintragen() {
    if (!patientCode || !terminartId || !startDatum || !endDatum) return;
    setLoading(true);
    setError("");
    setErfolg("");
    try {
      const res = await fetch("/api/warteliste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientCode, terminartId, startDatum, endDatum, fruehzeit, spaetzeit }),
      });
      const d = await res.json();
      if (res.ok) {
        setErfolg("Sie wurden auf die Warteliste gesetzt!");
        laden();
      } else {
        setError(d.error);
      }
    } catch {
      setError("Fehler");
    }
    setLoading(false);
  }

  async function entfernen(id: number) {
    await fetch(`/api/warteliste/${id}`, { method: "DELETE" });
    laden();
  }

  return (
    <main>
      <h1>Warteliste</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Lassen Sie sich benachrichtigen, wenn ein Termin frei wird.
      </p>

      {erfolg && <p style={{ color: "var(--primary-dark)", marginBottom: "1rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "4px" }}>{erfolg}</p>}
      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <section style={{ maxWidth: "500px", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        <input value={patientCode} onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
          placeholder="Patient-Code" style={inputStyle} disabled={isIdentified} />

        <select value={terminartId} onChange={(e) => setTerminartId(parseInt(e.target.value))} style={inputStyle}>
          <option value={0}>– Terminart wählen –</option>
          {terminarten.map((t: any) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input type="date" value={startDatum} onChange={(e) => setStartDatum(e.target.value)} style={{ ...inputStyle, width: "50%" }}
            placeholder="Frühestes Datum" />
          <input type="date" value={endDatum} onChange={(e) => setEndDatum(e.target.value)} style={{ ...inputStyle, width: "50%" }}
            placeholder="Spätestes Datum" />
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input type="time" value={fruehzeit} onChange={(e) => setFruehzeit(e.target.value)} style={{ ...inputStyle, width: "50%" }} />
          <input type="time" value={spaetzeit} onChange={(e) => setSpaetzeit(e.target.value)} style={{ ...inputStyle, width: "50%" }} />
        </div>

        <button onClick={eintragen} disabled={!patientCode || !terminartId || !startDatum || !endDatum || loading} style={{
          padding: "0.75rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600,
        }}>
          {loading ? "Wird eingetragen..." : "Auf Warteliste setzen"}
        </button>
      </section>

      {eintraege.length > 0 && (
        <section>
          <h2>Ihre Wartelisten-Einträge</h2>
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
            {eintraege.map((e: any) => (
              <div key={e.id} style={{ padding: "0.75rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{e.terminart.name}</strong><br />
                  <span style={{ fontSize: "0.85rem", color: "var(--gray-light)" }}>
                    {new Date(e.startDatum).toLocaleDateString("de-DE")} – {new Date(e.endDatum).toLocaleDateString("de-DE")} · {e.fruehzeit}–{e.spaetzeit} · Status: {e.status}
                  </span>
                </div>
                {e.status === "wartet" && (
                  <button onClick={() => entfernen(e.id)} style={{ padding: "0.3rem 0.6rem", background: "var(--accent-dark)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                    Austragen
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem", fontSize: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "100%",
};
