# decisions.md — Praxis Demir & Kollegen

_Stand: 03.07.2026_

---

## Entscheidungen

### 2026-07-03: Architektur: Next.js + Prisma + SQLite
- **Gewählt:** Next.js (App Router, TypeScript) + Prisma ORM + SQLite

### 2026-07-03: Seed-Daten
- Dr. Demir (Inhaberin), Dr. Yilmaz, Dr. Schäfer; 7 Terminarten; Sprechzeiten Mo–Fr 8–16 Uhr

### 2026-07-03: Feature PK-001 Online-Terminbuchung
- **Status:** done

### 2026-07-03: Feature PK-002 Wiederholungsrezept-Workflow
- **Status:** done

### 2026-07-03: Feature PK-003 DSGVO-konforme Patientenidentifikation
- **Details:** Jeder Patient erhält eindeutigen Code (PAT-XXXX), Identifikation per Code + Geburtsdatum, keine Klarnamen in URLs, Sperrstatus-Prüfung vor Buchung
- **APIs:** POST /api/patient/register, POST /api/patient/identify
- **UI:** Registrierungsseite (/patient/register), Login (/patient/login), aktualisierte Buchungsseite mit Code
- **Status:** done
