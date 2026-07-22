"use client";

import { useState } from "react";
import LoadingSpinner from "@/app/components/loading-spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get("code") || "";

  const [patientCode, setPatientCode] = useState(prefillCode);
  const [passwort, setPasswort] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "change-pw">("login");
  const [altesPasswort, setAltesPasswort] = useState("");
  const [neuesPasswort, setNeuesPasswort] = useState("");
  const [pwChangeCode, setPwChangeCode] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  async function login() {
    if (!patientCode || !passwort) return;
    setLoading(true);
    setError("");
    setPwSuccess("");
    try {
      const res = await fetch("/api/patient/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientCode, passwort }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem("patientCode", data.patient.patientCode);
        sessionStorage.setItem("patientName", data.patient.name);
        if (!data.patient.passwortGeaendert) {
          setMode("change-pw");
          setAltesPasswort(passwort);
          setPwChangeCode(patientCode);
          setPasswort("");
          setLoading(false);
          return;
        }
        router.push("/terminbuchung");
      } else {
        setError(data.error || "Anmeldung fehlgeschlagen");
      }
    } catch {
      setError("Fehler bei der Anmeldung");
    }
    setLoading(false);
  }

  async function changePassword() {
    if (!pwChangeCode || !altesPasswort || !neuesPasswort) return;
    if (neuesPasswort.length < 4) {
      setError("Passwort muss mindestens 4 Zeichen lang sein");
      return;
    }
    setLoading(true);
    setError("");
    setPwSuccess("");
    try {
      const res = await fetch("/api/patient/passwort", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientCode: pwChangeCode, altesPasswort, neuesPasswort }),
      });
      if (res.ok) {
        setPwSuccess("Passwort erfolgreich geändert! Sie werden weitergeleitet...");
        sessionStorage.setItem("patientCode", pwChangeCode);
        setTimeout(() => {
          // Wir haben keinen Namen – kurz über terminbuchung neu laden lassen
          router.push("/terminbuchung");
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Fehler beim Ändern");
      }
    } catch {
      setError("Fehler beim Ändern");
    }
    setLoading(false);
  }

  if (mode === "change-pw") {
    return (
      <main style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
        <h1>Passwort ändern</h1>
        <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
          Sie haben ein Standard-Passwort. Bitte legen Sie ein eigenes Passwort fest.
        </p>

        {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}
        {pwSuccess && <p style={{ color: "var(--primary-dark)", marginBottom: "1rem", padding: "0.75rem", background: "var(--primary-bg)", borderRadius: "4px" }}>{pwSuccess}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="password"
            placeholder="Altes Passwort"
            value={altesPasswort}
            disabled
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Neues Passwort (mind. 4 Zeichen)"
            value={neuesPasswort}
            onChange={(e) => setNeuesPasswort(e.target.value)}
            style={inputStyle}
            autoFocus
          />
          <button onClick={changePassword} disabled={!neuesPasswort || loading} style={{
            padding: "0.75rem 1.5rem", background: "var(--primary)", color: "white", border: "none",
            borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "1rem",
          }}>
            {loading ? "Wird gespeichert..." : "Passwort ändern"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      <h1>Patient Login</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Geben Sie Ihren Patient-Code und Ihr Passwort ein.
      </p>

      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          placeholder="Patient-Code (z.B. PAT-7F3A)"
          value={patientCode}
          onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          style={inputStyle}
        />
        <button onClick={login} disabled={!patientCode || !passwort || loading} style={{
          padding: "0.75rem 1.5rem", background: "var(--primary)", color: "white", border: "none",
          borderRadius: "4px", cursor: "pointer", fontWeight: 600, fontSize: "1rem",
        }}>
          {loading ? "Prüfe..." : "Anmelden"}
        </button>
      </div>

      <p style={{ marginTop: "1rem" }}>
        <a href="/patient/register" style={{ color: "var(--primary-dark)" }}>Noch nicht registriert? Hier anmelden</a>
      </p>
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
