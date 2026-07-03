"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [geburtsdatum, setGeburtsdatum] = useState("");
  const [telefonnummer, setTelefonnummer] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ patientCode: string; bereitsRegistriert: boolean } | null>(null);
  const [error, setError] = useState("");

  async function register() {
    if (!name || !geburtsdatum || !telefonnummer) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/patient/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, geburtsdatum, telefonnummer, email: email || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Registrierung fehlgeschlagen");
      }
    } catch {
      setError("Fehler bei der Registrierung");
    }
    setLoading(false);
  }

  if (result) {
    return (
      <main style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔑</div>
        <h1>{result.bereitsRegistriert ? "Bereits registriert" : "Registrierung erfolgreich"}</h1>
        <div style={{
          margin: "1.5rem 0", padding: "1rem", background: "var(--primary-bg)", borderRadius: "8px",
          border: "2px solid var(--primary)",
        }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Ihr persönlicher Patient-Code:</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--primary-dark)" }}>
            {result.patientCode}
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--gray)", marginTop: "0.5rem" }}>
            Diesen Code bei jeder Buchung verwenden. Nicht weitergeben.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
          <Link href={`/patient/login?code=${result.patientCode}`} style={{
            padding: "0.75rem 1.5rem", background: "var(--primary)", color: "white", textDecoration: "none",
            borderRadius: "4px", fontWeight: 600, display: "inline-block",
          }}>
            Zum Login
          </Link>
          <Link href="/terminbuchung" style={{ color: "var(--primary-dark)" }}>Termin buchen</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      <h1>Patient registrieren</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen — Einrichtung Ihres persönlichen Zugangs
      </p>

      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input placeholder="Name (Vor- und Nachname)" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        <input type="date" placeholder="Geburtsdatum" value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)} style={inputStyle} />
        <input type="tel" placeholder="Telefonnummer" value={telefonnummer} onChange={(e) => setTelefonnummer(e.target.value)} style={inputStyle} />
        <input type="email" placeholder="E-Mail (optional)" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <button onClick={register} disabled={!name || !geburtsdatum || !telefonnummer || loading} style={{
          padding: "0.75rem 1.5rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "1rem",
        }}>
          {loading ? "Wird registriert..." : "Registrieren"}
        </button>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem", fontSize: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "100%",
};
