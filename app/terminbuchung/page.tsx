"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Slot {
  arztId: number;
  arztName: string;
  terminartId: number;
  terminartName: string;
  datum: string;
  startzeit: string;
  endzeit: string;
  dauer: number;
}

export default function TerminbuchungPage() {
  const router = useRouter();
  const [datum, setDatum] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [patientName, setPatientName] = useState("");
  const [geburtsdatum, setGeburtsdatum] = useState("");
  const [telefonnummer, setTelefonnummer] = useState("");
  const [email, setEmail] = useState("");
  const [buchungLoading, setBuchungLoading] = useState(false);

  async function verfuegbarkeitSuchen() {
    if (!datum) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/termine/verfuegbarkeit?datum=${datum}`);
      const data = await res.json();
      if (data.verfuegbar === false) {
        setError(data.grund || "Keine Termine verfügbar");
        setSlots([]);
      } else {
        setSlots(data.termine || []);
        if (data.termine?.length === 0) setError("Keine freien Termine an diesem Tag");
      }
    } catch {
      setError("Fehler bei der Abfrage");
    }
    setLoading(false);
  }

  async function buchen() {
    if (!selectedSlot || !patientName || !geburtsdatum || !telefonnummer) return;
    setBuchungLoading(true);
    setError("");
    try {
      const res = await fetch("/api/termine/buchen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          geburtsdatum,
          telefonnummer,
          email: email || undefined,
          arztId: selectedSlot.arztId,
          terminartId: selectedSlot.terminartId,
          datum: selectedSlot.datum,
          startzeit: selectedSlot.startzeit,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/bestaetigung?terminId=${data.terminId}&patientId=${data.patientId}`);
      } else {
        setError(data.error || "Buchung fehlgeschlagen");
      }
    } catch {
      setError("Fehler bei der Buchung");
    }
    setBuchungLoading(false);
  }

  return (
    <main>
      <h1>Termin buchen</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen
      </p>

      {/* Datum-Auswahl */}
      <section style={{ marginBottom: "2rem" }}>
        <label htmlFor="datum" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
          Wählen Sie einen Termin:
        </label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            id="datum"
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            style={{ padding: "0.5rem", fontSize: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px" }}
          />
          <button onClick={verfuegbarkeitSuchen} disabled={!datum || loading} style={{
            padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600,
          }}>
            {loading ? "Suche..." : "Verfügbarkeit prüfen"}
          </button>
        </div>
      </section>

      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      {/* Verfügbare Slots */}
      {slots.length > 0 && !selectedSlot && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Verfügbare Termine am {datum}</h2>
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
            {slots.map((slot, i) => (
              <button key={i} onClick={() => setSelectedSlot(slot)} style={{
                textAlign: "left", padding: "0.75rem", border: "1px solid var(--primary)", borderRadius: "4px", background: "var(--primary-bg)", cursor: "pointer",
              }}>
                <strong>{slot.startzeit}–{slot.endzeit}</strong> &middot; {slot.arztName} &middot; {slot.terminartName} ({slot.dauer} Min.)
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Buchungsformular */}
      {selectedSlot && (
        <section style={{ marginBottom: "2rem", maxWidth: "500px" }}>
          <h2>Ihre Angaben</h2>
          <p style={{ margin: "0.5rem 0", color: "var(--gray)" }}>
            <strong>{selectedSlot.startzeit}–{selectedSlot.endzeit}</strong> &middot; {selectedSlot.arztName} &middot; {selectedSlot.terminartName}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            <input placeholder="Name (Vor- und Nachname)" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={inputStyle} />
            <input type="date" placeholder="Geburtsdatum" value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)} style={inputStyle} />
            <input type="tel" placeholder="Telefonnummer" value={telefonnummer} onChange={(e) => setTelefonnummer(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="E-Mail (optional)" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={buchen} disabled={!patientName || !geburtsdatum || !telefonnummer || buchungLoading} style={{
                padding: "0.75rem 1.5rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "1rem",
              }}>
                {buchungLoading ? "Buche..." : "Termin verbindlich buchen"}
              </button>
              <button onClick={() => setSelectedSlot(null)} style={{ padding: "0.75rem 1.5rem", background: "var(--surface)", border: "1px solid var(--gray-meta)", borderRadius: "4px", cursor: "pointer" }}>
                Zurück
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem", fontSize: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "100%",
};
