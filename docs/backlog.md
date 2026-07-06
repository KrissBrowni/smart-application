# backlog.md — Praxis Demir & Kollegen

_Stand: 03.07.2026_

---

## Konvention

- **ID-Schema:** `PK-NNN` (Praxis Demir & Kollegen)
- **Nummerierung:** fortlaufend, nie wiederverwendet
- **Referenzierung:** In Commits immer per ID

## Status-Werte

| Status | Bedeutung |
|--------|-----------|
| `hypo` | Hypothese, noch nicht validiert |
| `validated` | Mit Kunde bestätigt, aber noch kein Code |
| `in-progress` | Aktuell in Arbeit |
| `done` | Implementiert, im Commit referenziert |
| `killed` | Verworfen — Begründung in decisions.md |

## Features

| ID | Name | Phase | Status | Quelle | Notiz |
|----|------|-------|--------|--------|-------|
| PK-001 | Online-Terminbuchung mit Arztverfügbarkeit | 1 | done | docs/spec.md §7.1 P1 | Commit d25c292+ – Verfügbarkeits-API, Buchungs-API, UI |
| PK-002 | Wiederholungsrezept-Workflow | 1 | done | docs/spec.md §7.1 P2 | Rezeptanfragen digital, ärztliche Freigabe, Benachrichtigung |
| PK-003 | DSGVO-konforme Patientenidentifikation | 1 | done | docs/spec.md §7.1 P3 | Sichere ID bei jeder Buchung |
| PK-004 | Akutslots korrekt schützen | 1 | done | docs/spec.md §7.1 P4 | Akutsprechstunden nicht online buchbar |
| PK-005 | No-Show-Tracking | 2 | done | docs/spec.md §7.2 | Automatische Erfassung und Konsequenzen |
| PK-006 | Benachrichtigungen bei Terminänderung & Rezeptfreigabe | 2 | done | docs/spec.md §7.2 Should | SMS/E-Mail-Benachrichtigungen |
| PK-007 | Alternative Terminvorschläge bei Arzt-Ausfall | 2 | done | docs/spec.md §7.2 Should | |
| PK-008 | Wochenübersicht für Praxisinhaberin | 2 | done | docs/spec.md §7.2 Should | Einfache Kalenderansicht |
| PK-009 | Opt-in-Verwaltung für SMS/E-Mail | 2 | done | docs/spec.md §7.2 Should | |
| PK-010 | Online-Termin absagen/umbuchen | 2 | done | docs/spec.md §7.2 Should | |
| PK-011 | Warteliste für frei gewordene Termine | 3 | done | docs/spec.md §7.3 Could | |
| PK-012 | Patientenpräferenzen für Ärzt:innen | 3 | done | docs/spec.md §7.3 Could | |
| PK-013 | Dashboard für MFA-Team | 3 | done | docs/spec.md §7.3 Could | |
| PK-014 | No-Show-Brief-Vorlagen | 3 | hypo | docs/spec.md §7.3 Could | |
