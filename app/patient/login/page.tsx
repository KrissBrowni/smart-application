"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get("code") || "";

  const [patientCode, setPatientCode] = useState(prefillCode);
  const [geburtsdatum, setGeburtsdatum] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    if (!patientCode || !geburtsdatum) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patient/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientCode, geburtsdatum }),
      });
      const data = await res.json();
      if (res.ok) {
        // Patient-Code in sessionStorage speichern
        sessionStorage.setItem("patientCode", data.patient.patientCode);
        sessionStorage.setItem("patientName", data.patient.name);
        router.push("/terminbuchung");
      } else {
        setError(data.error || "Identifikation fehlgeschlagen");
      }
    } catch {
      setError("Fehler bei der Identifikation");
    }
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      <h1>Patient Login</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Geben Sie Ihren Patient-Code und Ihr Geburtsdatum ein.
      </p>

      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          placeholder="Patient-Code (z.B. PAT-7F3A)"
          value={patientCode}
          onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
          style={inputStyle}
        />
        <input type="date" placeholder="Geburtsdatum" value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)} style={inputStyle} />
        <button onClick={login} disabled={!patientCode || !geburtsdatum || loading} style={{
          padding: "0.75rem 1.5rem", background: "var(--primary)", color: "white", border: "none",
          borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "1rem",
        }}>
          {loading ? "Prüfe..." : "Identifizieren"}
        </button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Lädt...</div>}>
      <LoginContent />
    </Suspense>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.5rem", fontSize: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", width: "100%",
};
