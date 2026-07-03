"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TerminItem {
  id: number;
  datum: string;
  startzeit: string;
  endzeit: string;
  status: string;
  buchungsweg: string;
  terminart: { name: string };
  arzt: { name: string } | null;
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    geplant: "Geplant",
    wahrgenommen: "Wahrgenommen",
    abgesagt: "Abgesagt",
    verschoben: "Verschoben",
    no_show: "No-Show",
    arzt_ausfall_betroffen: "Arzt-Ausfall",
  };
  return map[s] || s;
}

export default function MeineTerminePage() {
  const router = useRouter();
  const [patientCode, setPatientCode] = useState("");
  const [data, setData] = useState<TerminItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [erfolg, setErfolg] = useState("");
  const [umbuchung, setUmbuchung] = useState<{ id: number; datum: string; startzeit: string } | null>(null);
  const [neuesDatum, setNeuesDatum] = useState("");
  const [neueStartzeit, setNeueStartzeit] = useState("");

  useEffect(() => {
    const code = sessionStorage.getItem("patientCode");
    if (code) {
      setPatientCode(code);
      laden(code);
    }
  }, []);

  async function laden(code?: string) {
    const c = code || patientCode;
    if (!c) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/termine/meine?patientCode=${c}`);
      const d = await res.json();
      if (res.ok) setData(d.termine || []);
      else setError(d.error);
    } catch {
      setError("Fehler beim Laden");
    }
    setLoading(false);
  }

  // Verfügbare Zeitslots basierend auf Datum laden
  const [verfuegbareSlots, setVerfuegbareSlots] = useState<{ startzeit: string }[]>([] );

  useEffect(() => {
    if (neuesDatum) {
      fetch(`/api/termine/verfuegbarkeit?datum=${neuesDatum}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.termine) {
            const unique = [...new Set(d.termine.map((s: any) => s.startzeit))].sort();
            setVerfuegbareSlots(unique.map((s) => ({ startzeit: s as string })));
          }
        });
    }
  }, [neuesDatum]);

  return (
    <main>
      <h1>Meine Termine</h1>
      <p style={{ marginBottom: "1.5rem", color: "var(--gray-light)" }}>
        Praxis Demir & Kollegen
      </p>

      <section style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        <input value={patientCode} onChange={(e) => setPatientCode(e.target.value.toUpperCase())} placeholder="Patient-Code"
          style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px" }} />
        <button onClick={() => laden()} disabled={!patientCode} style={btnStyle}>Suchen</button>
      </section>

      {loading && <p>Lade...</p>}
      {error && <p style={{ color: "var(--accent-dark)", marginBottom: "1rem" }}>{error}</p>}
      {erfolg && <p style={{ color: "var(--primary-dark)", marginBottom: "1rem", padding: "0.5rem", background: "var(--primary-bg)", borderRadius: "4px" }}>{erfolg}</p>}

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {data.map((t) => (
          <div key={t.id} style={{ padding: "1rem", border: "1px solid var(--gray-meta)", borderRadius: "4px", background: "var(--white)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <strong>{new Date(t.datum).toLocaleDateString("de-DE")} {t.startzeit}–{t.endzeit}</strong><br />
                <span style={{ color: "var(--gray-light)", fontSize: "0.9rem" }}>
                  {t.terminart.name} &middot; {t.arzt?.name} &middot; <strong>{statusLabel(t.status)}</strong>
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {t.status === "geplant" && (
                  <>
                    <button onClick={async () => {
                      const res = await fetch(`/api/termine/${t.id}/absagen`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ patientCode }),
                      });
                      if (res.ok) { setErfolg("Termin abgesagt!"); laden(); }
                      else { const d = await res.json(); setError(d.error); }
                    }} style={{ ...btnStyle, background: "var(--accent-dark)" }}>Absagen</button>

                    <button onClick={() => {
                      setUmbuchung({ id: t.id, datum: t.datum.split("T")[0], startzeit: t.startzeit });
                      setNeuesDatum(t.datum.split("T")[0]);
                      setNeueStartzeit("");
                    }} style={btnStyle}>Umbuchen</button>
                  </>
                )}
              </div>
            </div>

            {/* Umbuchungs-UI */}
            {umbuchung?.id === t.id && (
              <div style={{ marginTop: "1rem", padding: "1rem", borderTop: "1px solid var(--gray-meta)" }}>
                <p><strong>Neuen Termin wählen:</strong></p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <input type="date" value={neuesDatum} onChange={(e) => setNeuesDatum(e.target.value)} style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px" }} />
                  <select value={neueStartzeit} onChange={(e) => setNeueStartzeit(e.target.value)} style={{ padding: "0.5rem", border: "1px solid var(--gray-meta)", borderRadius: "4px" }}>
                    <option value="">– Uhrzeit –</option>
                    {verfuegbareSlots.map((s, i) => (
                      <option key={i} value={s.startzeit}>{s.startzeit}</option>
                    ))}
                  </select>
                  <button onClick={async () => {
                    if (!neuesDatum || !neueStartzeit) return;
                    const res = await fetch(`/api/termine/${t.id}/umbuchen`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ patientCode, neueStartzeit, neuesDatum }),
                    });
                    if (res.ok) { setErfolg("Termin umgebucht!"); setUmbuchung(null); laden(); }
                    else { const d = await res.json(); setError(d.error); }
                  }} style={{ ...btnStyle, background: "var(--accent)" }}>
                    Bestätigen
                  </button>
                  <button onClick={() => setUmbuchung(null)} style={{ ...btnStyle, background: "var(--gray)" }}>Abbrechen</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!loading && data.length === 0 && <p style={{ color: "var(--gray-light)" }}>Keine Termine gefunden.</p>}
      </div>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "0.4rem 0.75rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem",
};
