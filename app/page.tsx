import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Hero-Bereich */}
      <section className="hero" style={{
        textAlign: "center", padding: "3rem 1rem",
        background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
        color: "white", borderRadius: "12px", marginBottom: "2rem",
      }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Praxis Demir & Kollegen</h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: "1.5rem" }}>
          Terminbuchungs- und Verwaltungssoftware
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/patient/register" className="btn-primary">
            Jetzt registrieren
          </Link>
          <Link href="/terminbuchung" className="btn-outline">
            Termin buchen
          </Link>
        </div>
      </section>

      {/* Kacheln */}
      <div className="kacheln-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "1rem", marginBottom: "2rem",
      }}>
        <Kachel
          titel="🩺 Termin buchen"
          text="Online-Termin bei Ihrem Wunsch-Arzt buchen – schnell und unkompliziert."
          href="/terminbuchung"
        />
        <Kachel
          titel="💊 Rezept anfragen"
          text="Wiederholungsrezept digital anfordern und Status verfolgen."
          href="/rezept-anfragen"
        />
        <Kachel
          titel="📅 Meine Termine"
          text="Alle Ihre Termine einsehen, umbuchen oder absagen."
          href="/meine-termine"
        />
        <Kachel
          titel="🔔 Benachrichtigungen"
          text="E-Mail- oder SMS-Erinnerungen für Termine und Rezepte verwalten."
          href="/opt-in"
        />
        <Kachel
          titel="⏳ Warteliste"
          text="Auf freiwerdende Termine setzen und benachrichtigt werden."
          href="/warteliste"
        />
        <Kachel
          titel="📊 Dashboard (MFA)"
          text="Praxis-Übersicht mit Kennzahlen, Terminen und Rezept-Anfragen."
          href="/dashboard"
        />
      </div>

      {/* Info */}
      <section className="info-section" style={{
        padding: "1.5rem", background: "var(--surface)", borderRadius: "8px",
        border: "1px solid var(--gray-meta)",
      }}>
        <h2>Willkommen in Ihrer Praxis-App</h2>
        <p style={{ color: "var(--gray)", marginTop: "0.5rem" }}>
          Als Patient können Sie Termine online buchen, Wiederholungsrezepte anfordern,
          Ihre Benachrichtigungseinstellungen verwalten und sich auf eine Warteliste setzen.
          <br /><br />
          <strong>Noch nicht registriert?</strong>{" "}
          <Link href="/patient/register" style={{ color: "var(--primary-dark)" }}>
            Hier registrieren
          </Link>{" "}
          – Sie erhalten sofort Ihren persönlichen Patient-Code.
        </p>
      </section>
    </main>
  );
}

function Kachel({ titel, text, href }: { titel: string; text: string; href: string }) {
  return (
    <Link href={href} className="kachel-link">
      <div className="kachel">
        <h3 style={{ marginBottom: "0.5rem" }}>{titel}</h3>
        <p style={{ color: "var(--gray-light)", fontSize: "0.9rem" }}>{text}</p>
      </div>
    </Link>
  );
}
