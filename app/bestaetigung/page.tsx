"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function BestaetigungContent() {
  const searchParams = useSearchParams();
  const terminId = searchParams.get("terminId");
  const patientId = searchParams.get("patientId");

  return (
    <main style={{ textAlign: "center", paddingTop: "4rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
      <h1>Termin gebucht!</h1>
      <p style={{ margin: "1rem 0", color: "var(--gray-light)", fontSize: "1.1rem" }}>
        Ihre Buchung war erfolgreich.
      </p>
      <p style={{ color: "var(--gray)" }}>
        Termin-ID: <strong>{terminId}</strong><br />
        Patienten-ID: <strong>{patientId}</strong>
      </p>
      <p style={{ marginTop: "1rem", color: "var(--gray-light)" }}>
        Sie erhalten in Kürze eine Bestätigung.
      </p>
      <a href="/terminbuchung" style={{
        display: "inline-block", marginTop: "1.5rem", padding: "0.75rem 1.5rem",
        background: "var(--primary)", color: "white", textDecoration: "none", borderRadius: "4px", fontWeight: 600,
      }}>
        Weiteren Termin buchen
      </a>
    </main>
  );
}

export default function BestaetigungPage() {
  return (
    <Suspense fallback={<div>Lädt...</div>}>
      <BestaetigungContent />
    </Suspense>
  );
}
