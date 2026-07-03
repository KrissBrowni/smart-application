"use client";

import { useState, useEffect } from "react";

interface PatientItem {
  id: number;
  name: string;
  patientCode: string;
  email: string | null;
  emailOptIn: boolean;
  smsOptIn: boolean;
  telefonnummer: string;
}

export default function OptInVerwaltungPage() {
  const [patienten, setPatienten] = useState<PatientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [suche, setSuche] = useState("");

  async function laden() {
    setLoading(true);
    try {
      const res = await fetch("/api/patient/opt-in?patientCode=ALLE");
      // Fallback: Alle Patienten über separate API laden
      const res2 = await fetch("/api/benachrichtigungen");
      // Nutze die Benachrichtigungen-API um Patienten-IDs zu bekommen
      const data = await res2.json();
      // Extrahiere eindeutige Patienten
      const unique = new Map<number, PatientItem>();
      for (const b of data.benachrichtigungen || []) {
        if (!unique.has(b.patient.id)) {
          unique.set(b.patient.id, {
            id: b.patient.id,
            name: b.patient.name,
            patientCode: b.patient.patientCode,
            email: null,
            emailOptIn: false,
            smsOptIn: false,
            telefonnummer: "",
          });
        }
      }
      setPatienten(Array.from(unique.values()));
    } catch {
      setPatienten([]);
    }
    setLoading(false);
  }

  useEffect(() => { laden(); }, []);

  const gefiltert = suche
    ? patienten.filter((p) => p.name.toLowerCase().includes(suche.toLowerCase()) || p.patientCode.toLowerCase().includes(suche.toLowerCase()))
    : patienten;

  async function toggleOptIn(patientCode: string, feld: "smsOptIn" | "emailOptIn", aktuell: boolean) {
    await fetch("/api/patient/opt-in", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientCode, [feld]: !aktuell }),
    });
    laden();
  }

  return (
    <main>
      <h1>Opt-In-Verwaltung</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Nur für MFAs
      </p>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        <input value={suche} onChange={(e) => setSuche(e.target.value)}
          placeholder="Patient suchen..." style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "300px" }} />
        <button onClick={laden} style={{ padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Aktualisieren
        </button>
      </div>

      {loading && <p>Lade...</p>}

      <div style={{ display: "grid", gap: "0.5rem" }}>
        {gefiltert.map((p) => (
          <div key={p.id} style={{ padding: "0.75rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", background: "var(--white)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{p.name}</strong> ({p.patientCode})
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem" }}>
                <input type="checkbox" checked={p.smsOptIn} onChange={() => toggleOptIn(p.patientCode, "smsOptIn", p.smsOptIn)} />
                SMS
              </label>
              <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem" }}>
                <input type="checkbox" checked={p.emailOptIn} onChange={() => toggleOptIn(p.patientCode, "emailOptIn", p.emailOptIn)} />
                E-Mail
              </label>
            </div>
          </div>
        ))}
        {!loading && gefiltert.length === 0 && <p style={{ color: "var(--gray-light)" }}>Keine Patienten gefunden.</p>}
      </div>
    </main>
  );
}
