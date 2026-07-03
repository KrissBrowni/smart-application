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
- **Status:** done

### 2026-07-03: Feature PK-005 No-Show-Tracking
- **Details:** PATCH /api/termine/[id]/no-show (No-Show markieren, Zähler +1), PATCH /api/patientensperre/[id]/aufheben (Sperre aufheben durch leitende MFA), GET /api/no-show-protokoll, MFA-UI (/no-show-verwaltung)
- **Geschäftsregel:** 3 No-Shows → automatische Online-Sperre, leitende MFA kann Sperre aufheben
- **APIs:** 4 neue Endpunkte + Übersichtsseite
- **Status:** done

### 2026-07-03: Feature PK-006 Benachrichtigungen
- **Details:** GET /api/benachrichtigungen (Patient + MFA), PATCH /api/benachrichtigungen/[id] (Status-Update), automatische Erzeugung bei Buchung (Erinnerung) + Rezeptfreigabe + No-Show (Warnung), UI für Patienten (/benachrichtigungen) und MFAs (/benachrichtigungen-verwaltung)
- **Status:** done

### 2026-07-03: Feature PK-007 Alternative Terminvorschläge bei Arzt-Ausfall
- **Details:** GET /api/termine/arzt-ausfall (Vorschau betroffener Termine + alternative Ärzte), POST /api/termine/arzt-ausfall (Ausfall melden, Termine als betroffen markieren, Benachrichtigungen erzeugen), MFA-UI (/arzt-ausfall)
- **Status:** done

### 2026-07-03: Feature PK-008 Wochenübersicht für Praxisinhaberin
- **Details:** GET /api/wochenuebersicht?kw=&jahr= (berechnet Kennzahlen aus DB), UI mit Karten-Ansicht (/wochenuebersicht), Navigation zwischen Wochen
- **Kennzahlen:** Termine gesamt, Online-Buchungsquote, No-Show-Rate, offene Rezeptanfragen, Akutslot-Auslastung, No-Shows pro Arzt
- **Status:** done

### 2026-07-03: Feature PK-009 Opt-in-Verwaltung für SMS/E-Mail
- **Details:** GET/PATCH /api/patient/opt-in (abrufen + aktualisieren), jede Änderung als Einwilligung dokumentiert, Patientenseite (/opt-in) und MFA-Seite (/opt-in-verwaltung)
- **Status:** done

### 2026-07-03: Feature PK-010 Online-Termin absagen/umbuchen
- **Details:** GET /api/termine/meine (Termine eines Patienten), PATCH /api/termine/[id]/absagen (Absage + Benachrichtigung), PATCH /api/termine/[id]/umbuchen (neuer Slot + Status "verschoben"), Patientenseite (/meine-termine)
- **Status:** done
