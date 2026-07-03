"use client";

import { useState, useEffect } from "react";
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
  const [patientCode, setPatientCode] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isIdentified, setIsIdentified] = useState(false);
  const [datum, setDatum] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [buchungLoading, setBuchungLoading] = useState(false);

  useEffect(() => {
    const code = sessionStorage.getItem("patientCode");
    const name = sessionStorage.getItem("patientName");
    if (code && name) {
      setPatientCode(code);
      setPatientName(name);
      setIsIdentified(true);
    }
  }, []);

  function login() {
    if (patientCode) {
      router.push(`/patient/login?code=${patientCode}`);
    } else {
      router.push("/patient/login");
    }
  }

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
    if (!selectedSlot || !patientCode) return;
    setBuchungLoading(true);
    setError("");
    try {
      const res = await fetch("/api/termine/buchen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientCode,
          arztId: selectedSlot.arztId,
          terminartId: selectedSlot.terminartId,
          datum: selectedSlot.datum,
          startzeit: selectedSlot.startzeit,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/bestaetigung?terminId=${data.terminId}`);
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

      {/* Identifikation */}
      {!isIdentified ? (
        <section style={{ marginBottom: "2rem", padding: "1.5rem", background: "var(--primary-bg)", borderRadius: "8px" }}>
          <h2>Patienten-Identifikation erforderlich</h2>
          <p style={{ margin: "0.5rem 0", color: "var(--gray)" }}>
            Sie benötigen Ihren persönlichen Patient-Code, um einen Termin zu buchen.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <input
              placeholder="Patient-Code (z.B. PAT-7F3A)"
              value={patientCode}
              onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
              style={inputStyle}
            />
            <button onClick={() => { if (patientCode) router.push(`/patient/login?code=${patientCode}`); else router.push("/patient/login"); }}
              style={{ padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Einloggen
            </button>
          </div>
          <p style={{ marginTop: "0.75rem" }}>
            <a href="/patient/register" style={{ color: "var(--primary-dark)" }}>Noch nicht registriert? Hier anmelden</a>
          </p>
        </section>
      ) : (
        <>
          <section style={{ marginBottom: "1rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "4px" }}>
            Angemeldet als <strong>{patientName}</strong> (Code: {patientCode})
            <button onClick={() => { sessionStorage.clear(); setIsIdentified(false); }} style={{
              marginLeft: "1rem", padding: "0.25rem 0.5rem", background: "transparent", border: "1px solid var(--primary)", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem",
            }}>
              Abmelden
            </button>
          </section>

          {/* Datum-Auswahl */}
          <section style={{ marginBottom: "2rem" }}>
            <label htmlFor="datum" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
              Wählen Sie einen Termin:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                id="datum" type="date" value={datum}
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

          {selectedSlot && (
            <section style={{ marginBottom: "2rem", maxWidth: "500px" }}>
              <h2>Buchung bestätigen</h2>
              <p style={{ margin: "0.5rem 0", color: "var(--gray)" }}>
                <strong>{selectedSlot.startzeit}–{selectedSlot.endzeit}</strong> &middot; {selectedSlot.arztName} &middot; {selectedSlot.terminartName}
              </p>
              <p style={{ color: "var(--gray-light)", fontSize: "0.9rem" }}>
                Patient: {patientName} ({patientCode})
              </p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={buchen} disabled={buchungLoading} style={{
                  padding: "0.75rem 1.5rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "1rem",
                }}>
                  {buchungLoading ? "Buche..." : "Termin verbindlich buchen"}
                </button>
                <button onClick={() => setSelectedSlot(null)} style={{ padding: "0.75rem 1.5rem", background: "var(--surface)", border: "1px solid var(--gray-meta)", borderRadius: "4px", cursor: "pointer" }}>
                  Zurück
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem", fontSize: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "100%", maxWidth: "300px",
};
