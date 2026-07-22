"use client";

import { useState } from "react";
import LoadingSpinner from "@/app/components/loading-spinner";

export default function RezeptAnfragenPage() {
  const [patientName, setPatientName] = useState("");
  const [geburtsdatum, setGeburtsdatum] = useState("");
  const [telefonnummer, setTelefonnummer] = useState("");
  const [medikament, setMedikament] = useState("");
  const [loading, setLoading] = useState(false);
  const [erfolg, setErfolg] = useState("");
  const [error, setError] = useState("");

  async function anfragen() {
    if (!patientName || !geburtsdatum || !medikament) return;
    setLoading(true);
    setError("");
    setErfolg("");
    try {
      const res = await fetch("/api/rezepte/anfragen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName, geburtsdatum, telefonnummer, medikament }),
      });
      const data = await res.json();
      if (res.ok) {
        setErfolg(`Anfrage erfolgreich! ID: ${data.anfrageId}`);
        setMedikament("");
      } else {
        setError(data.error || "Fehler bei der Anfrage");
      }
    } catch {
      setError("Fehler bei der Anfrage");
    }
  }

  return (
    <main>
      <h1>Wiederholungsrezept anfragen</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen
      </p>

      {erfolg && <p style={{ color: "var(--primary-dark)", marginBottom: "1rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "4px" }}>{erfolg}</p>}
      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <section style={{ maxWidth: "500px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input placeholder="Name (Vor- und Nachname)" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={inputStyle} />
          <input type="date" placeholder="Geburtsdatum" value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)} style={inputStyle} />
          <input type="tel" placeholder="Telefonnummer (optional)" value={telefonnummer} onChange={(e) => setTelefonnummer(e.target.value)} style={inputStyle} />
          <input placeholder="Medikament (Name oder Referenz)" value={medikament} onChange={(e) => setMedikament(e.target.value)} style={inputStyle} />
          <button onClick={anfragen} disabled={!patientName || !geburtsdatum || !medikament || loading} style={{
            padding: "0.75rem 1.5rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "1rem",
          }}>
            {loading ? "Wird gesendet..." : "Rezept anfragen"}
          </button>
        </div>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem", fontSize: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "100%",
};
