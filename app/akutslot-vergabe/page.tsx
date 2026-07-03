"use client";

import { useState, useEffect } from "react";

interface AkutSlot {
  id: number;
  arztId: number;
  arzt: { id: number; name: string };
  datum: string;
  startzeit: string;
  endzeit: string;
  status: string;
}

export default function AkutslotVergabePage() {
  const [datum, setDatum] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState<AkutSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [erfolg, setErfolg] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AkutSlot | null>(null);
  const [patientName, setPatientName] = useState("");
  const [geburtsdatum, setGeburtsdatum] = useState("");
  const [telefonnummer, setTelefonnummer] = useState("");
  const [mfaId, setMfaId] = useState(1);
  const [vergibt, setVergibt] = useState(false);

  async function suchen() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/mfa/akutslot?datum=${datum}`);
      const data = await res.json();
      setSlots(data.slots || []);
      if (data.slots?.length === 0) setError("Keine freien Akutslots an diesem Datum");
    } catch {
      setError("Fehler beim Laden");
    }
    setLoading(false);
  }

  useEffect(() => { suchen(); }, [datum]);

  async function vergeben() {
    if (!selectedSlot || !patientName || !geburtsdatum || !telefonnummer) return;
    setVergibt(true);
    setError("");
    setErfolg("");
    try {
      const res = await fetch("/api/mfa/akutslot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          patientName,
          geburtsdatum,
          telefonnummer,
          mfaId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setErfolg(`Akutslot vergeben! Termin-ID: ${data.terminId}, Patient-Code: ${data.patientCode}`);
        setSelectedSlot(null);
        setPatientName("");
        setGeburtsdatum("");
        setTelefonnummer("");
        suchen();
      } else {
        setError(data.error || "Vergabe fehlgeschlagen");
      }
    } catch {
      setError("Fehler bei der Vergabe");
    }
    setVergibt(false);
  }

  return (
    <main>
      <h1>Akutslot-Vergabe</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Nur für MFAs
      </p>

      {erfolg && <p style={{ color: "var(--primary-dark)", marginBottom: "1rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "4px" }}>{erfolg}</p>}
      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <section style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="mfaId" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>MFA:</label>
        <select id="mfaId" value={mfaId} onChange={(e) => setMfaId(parseInt(e.target.value))} style={inputStyle}>
          <option value={1}>Leitende MFA</option>
          <option value={2}>MFA 2</option>
          <option value={3}>MFA 3</option>
          <option value={4}>MFA 4</option>
        </select>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="datum" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Datum:</label>
        <input id="datum" type="date" value={datum} onChange={(e) => setDatum(e.target.value)} style={inputStyle} />
      </section>

      {/* Freie Akutslots */}
      {slots.length > 0 && !selectedSlot && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Freie Akutslots am {datum}</h2>
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
            {slots.map((slot) => (
              <button key={slot.id} onClick={() => setSelectedSlot(slot)} style={{
                textAlign: "left", padding: "0.75rem", border: "1px solid var(--accent)", borderRadius: "4px", background: "#FFF3E8", cursor: "pointer",
              }}>
                <strong>{slot.startzeit}–{slot.endzeit}</strong> &middot; {slot.arzt.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Vergabe-Formular */}
      {selectedSlot && (
        <section style={{ maxWidth: "500px" }}>
          <h2>Patient für Akutslot erfassen</h2>
          <p style={{ margin: "0.5rem 0", color: "var(--gray)" }}>
            <strong>{selectedSlot.startzeit}–{selectedSlot.endzeit}</strong> &middot; {selectedSlot.arzt.name}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            <input placeholder="Name (Vor- und Nachname)" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={inputStyle} />
            <input type="date" placeholder="Geburtsdatum" value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)} style={inputStyle} />
            <input type="tel" placeholder="Telefonnummer" value={telefonnummer} onChange={(e) => setTelefonnummer(e.target.value)} style={inputStyle} />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={vergeben} disabled={!patientName || !geburtsdatum || !telefonnummer || vergibt} style={{
                padding: "0.75rem 1.5rem", background: "var(--accent)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "1rem",
              }}>
                {vergibt ? "Vergibt..." : "Akutslot vergeben"}
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
  padding: "0.5rem", fontSize: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "100%", maxWidth: "400px",
};
