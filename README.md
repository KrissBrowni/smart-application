# Praxis Demir & Kollegen — Terminbuchungs- und Verwaltungssoftware

Smart Applications SB52.2 · Sommersemester 2026 · HTW Berlin

## Setup

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Gehe zu http://localhost:3000

## Tech-Stack

- **Frontend & Backend:** Next.js (App Router, TypeScript)
- **Datenbank:** SQLite (via Prisma ORM)
- **KI-Tool:** Codex CLI

## Features

| ID | Feature | Status |
|----|---------|--------|
| PK-001 | Online-Terminbuchung mit Arztverfügbarkeit | ✅ |
| PK-002 | Wiederholungsrezept-Workflow | ✅ |
| PK-003 | DSGVO-konforme Patientenidentifikation | ✅ |
| PK-004 | Akutslots korrekt schützen | ✅ |
| PK-005 | No-Show-Tracking | ✅ |
| PK-006 | Benachrichtigungen | ✅ |
| PK-007 | Alternative Terminvorschläge bei Arzt-Ausfall | ✅ |
| PK-008 | Wochenübersicht für Praxisinhaberin | ✅ |
| PK-009 | Opt-in-Verwaltung für SMS/E-Mail | ✅ |
| PK-010 | Online-Termin absagen/umbuchen | ✅ |

## Seiten

- `/terminbuchung` — Online-Termin buchen (nach Patient-Login)
- `/patient/login` — Patient-Login mit Code + Geburtsdatum
- `/patient/register` — Patienten-Registrierung
- `/meine-termine` — Eigene Termine ansehen, absagen, umbuchen
- `/rezept-anfragen` — Wiederholungsrezept beantragen
- `/rezepte-verwaltung` — Rezeptanfragen verwalten (MFA)
- `/akutslot-vergabe` — Akutslots vergeben (MFA)
- `/no-show-verwaltung` — No-Shows erfassen, Sperren verwalten (MFA)
- `/arzt-ausfall` — Arzt-Ausfall melden (MFA)
- `/benachrichtigungen` — Eigene Benachrichtigungen einsehen
- `/benachrichtigungen-verwaltung` — Benachrichtigungs-Status (MFA)
- `/opt-in` — Kommunikationspräferenzen verwalten
- `/opt-in-verwaltung` — Opt-Ins aller Patienten (MFA)
- `/wochenuebersicht` — Kennzahlen pro Kalenderwoche
