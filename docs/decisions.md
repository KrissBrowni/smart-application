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
- **Status:** done

### 2026-07-03: Feature PK-004 Akutslots korrekt schützen
- **Details:** Tägliche Akut-Slot-Blöcke (8:00, 9:00, 10:00), nicht online sichtbar, MFA-API zur Vergabe
- **APIs:** GET /api/mfa/akutslot, POST /api/mfa/akutslot
- **UI:** /akutslot-vergabe (nur MFAs)
- **Status:** done
