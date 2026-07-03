# decisions.md — Praxis Demir & Kollegen

_Stand: 03.07.2026_

## Format
- Entscheidungen im Format: `YYYY-MM-DD: [Titel]`
- Jede Entscheidung kurz: Kontext, Optionen, Gewählte Option, Begründung

---

## Entscheidungen

### 2026-07-03: Architektur: Next.js + Prisma + SQLite
- **Kontext:** Framework-Wahl für das Projekt
- **Optionen:** Next.js, Flask, Django, FastAPI
- **Gewählt:** Next.js (App Router, TypeScript) + Prisma ORM + SQLite
- **Begründung:** Kurs-Empfehlung (Modul 5), React-basiert, Codex baut flüssig, SQLite null Setup

### 2026-07-03: Seed-Daten: Ärzt:innen, Terminarten, Sprechzeiten
- **Kontext:** Initiale Daten für Entwicklung und Tests
- **Gewählt:** Dr. Demir (Inhaberin), Dr. Yilmaz, Dr. Schäfer; 7 Terminarten; Sprechzeiten Mo–Fr 8–16 Uhr
- **Begründung:** Abbildung der Praxis Demir & Kollegen aus der Spec

### 2026-07-03: Feature PK-001 Online-Terminbuchung
- **Kontext:** Kernfeature Phase 1
- **Details:** Verfügbarkeits-API (GET /api/termine/verfuegbarkeit), Buchungs-API (POST /api/termine/buchen), Buchungsseite (/terminbuchung), Bestätigungsseite (/bestaetigung)
- **Status:** done (Commit d25c292+)
