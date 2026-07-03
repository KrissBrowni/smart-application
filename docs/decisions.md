# decisions.md — Praxis Demir & Kollegen

_Stand: 03.07.2026_

---

## Entscheidungen

### 2026-07-03: Architektur: Next.js + Prisma + SQLite
- **Kontext:** Framework-Wahl
- **Gewählt:** Next.js (App Router, TypeScript) + Prisma ORM + SQLite
- **Begründung:** Kurs-Empfehlung (Modul 5), React-basiert, Codex baut flüssig, SQLite null Setup

### 2026-07-03: Seed-Daten
- **Gewählt:** Dr. Demir (Inhaberin), Dr. Yilmaz, Dr. Schäfer; 7 Terminarten; Sprechzeiten Mo–Fr 8–16 Uhr

### 2026-07-03: Feature PK-001 Online-Terminbuchung
- **Status:** done

### 2026-07-03: Feature PK-002 Wiederholungsrezept-Workflow
- **Details:** POST /api/rezepte/anfragen (Patient reicht ein), GET /api/rezepte (Liste für MFA/Arzt), PATCH /api/rezepte/[id]/freigeben (Freigabe/Ablehnung), UI-Seiten für Patient und Verwaltung
- **Geschäftsregel:** 3-Monats-Intervallblockade nach Freigabe
- **Status:** done
