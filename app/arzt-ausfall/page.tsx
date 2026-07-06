"use client";

import { useState, useEffect } from "react";

interface Arzt {
  id: number;
  name: string;
  verfuegbarkeitsstatus: string;
}

interface TerminItem {
  id: number;
  patient: { id: number; name: string; patientCode: string };
  terminart: { id: number; name: string; defaultDauerMin: number };
  startzeit: string;
  datum: string;
}

export default function ArztAusfallPage() {
  const [aerzte, setAerzte] = useState<Arzt[]>([]);
  const [arztId, setArztId] = useState<number>(1);
  const [datum, setDatum] = useState(new Date().toISOString().split("T")[0]);
  const [grund, setGrund] = useState("krankheit");
  const [loading, setLoading] = useState(false);
  const [loadingVorschau, setLoadingVorschau] = useState(false);
  const [error, setError] = useState("");
  const [erfolg, setErfolg] = useState("");
  const [vorschau, setVorschau] = useState<{ termine: TerminItem[]; alternativeAerzte: Arzt[] } | null>(null);

  useEffect(() => {
    fetch("/api/termine/verfuegbarkeit?datum=" + new Date().toISOString().split("T")[0])
      .then(() => {});
    // Ärzte-Liste aus seed ist bekannt
    setAerzte([
      { id: 1, name: "Dr. Aylin Demir", verfuegbarkeitsstatus: "verfuegbar" },
      { id: 2, name: "Dr. Yilmaz", verfuegbarkeitsstatus: "verfuegbar" },
      { id: 3, name: "Dr. Schäfer", verfuegbarkeitsstatus: "verfuegbar" },
    ]);
  }, []);

  async function vorschauAnzeigen() {
    setLoadingVorschau(true);
    setError("");
    setVorschau(null);
    try {
      const res = await fetch(`/api/termine/arzt-ausfall?arztId=${arztId}&datum=${datum}`);
      const data = await res.json();
      setVorschau(data);
      if (data.termine?.length === 0) setError("Keine betroffenen Termine an diesem Tag");
    } catch {
      setError("Fehler bei der Vorschau");
    }
    setLoadingVorschau(false);
  }

  async function ausfallMelden() {
    if (!arztId || !datum) return;
    setLoading(true);
    setError("");
    setErfolg("");
    try {
      const res = await fetch("/api/termine/arzt-ausfall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arztId, datum, grund }),
      });
      const data = await res.json();
      if (res.ok) {
        setErfolg(
          `Ausfall gemeldet! ${data.betroffeneTermine} Termine betroffen, ${data.patienten.length} Patienten benachrichtigt.`
        );
        setVorschau(null);
      } else {
        setError(data.error || "Fehler");
      }
    } catch {
      setError("Fehler beim Melden");
    }
    setLoading(false);
  }

  return (
    <main>
      <h1>Arzt-Ausfall melden</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Nur für MFAs
      </p>

      {erfolg && <p style={{ color: "var(--primary-dark)", marginBottom: "1rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "4px" }}>{erfolg}</p>}
      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <section style={{ maxWidth: "500px", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Ärztin/Arzt:</label>
          <select value={arztId} onChange={(e) => setArztId(parseInt(e.target.value))} style={inputStyle}>
            {aerzte.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Datum:</label>
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Grund:</label>
          <select value={grund} onChange={(e) => setGrund(e.target.value)} style={inputStyle}>
            <option value="krankheit">Krankheit</option>
            <option value="urlaub">Urlaub</option>
            <option value="fortbildung">Fortbildung</option>
          </select>
        </div>
        <button onClick={vorschauAnzeigen} disabled={loadingVorschau} style={{
          padding: "0.75rem", background: "var(--gray)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600,
        }}>
          {loadingVorschau ? "Prüfe..." : "Betroffene Termine anzeigen"}
        </button>
      </section>

      {/* Vorschau betroffener Termine */}
      {vorschau && vorschau.termine.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Betroffene Termine</h2>
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
            {vorschau.termine.map((t) => (
              <div key={t.id} style={{ padding: "0.75rem", border: "1px solid var(--accent)", borderRadius: "4px", background: "#FFF3E8" }}>
                <strong>{t.patient.name}</strong> ({t.patient.patientCode})<br />
                <span style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
                  {t.startzeit} &middot; {t.terminart.name}
                </span>
              </div>
            ))}
          </div>

          {vorschau.alternativeAerzte.length > 0 && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "4px" }}>
              <strong>Alternative Ärzt:innen verfügbar:</strong>
              <ul style={{ margin: "0.5rem 0 0 1.25rem" }}>
                {vorschau.alternativeAerzte.map((a) => (
                  <li key={a.id}>{a.name}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={ausfallMelden} disabled={loading} style={{
            marginTop: "1rem", padding: "0.75rem 1.5rem", background: "var(--accent-dark)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600,
          }}>
            {loading ? "Wird gemeldet..." : "Ausfall bestätigen & Termine benachrichtigen"}
          </button>
        </section>
      )}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem", fontSize: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "100%",
};
