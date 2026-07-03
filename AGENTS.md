# AGENTS.md — Praxis Demir & Kollegen

## Projekt
Terminbuchungs- und Verwaltungssoftware für eine allgemeinmedizinische Gemeinschaftspraxis. Reduziert Telefonaufwand durch Online-Buchung, Wiederholungsrezept-Workflow, No-Show-Tracking und DSGVO-konforme Patientenverwaltung.

## Was bauen wir?
→ Lies docs/spec.md (Spezifikation)
→ Lies docs/backlog.md (Feature-IDs + Status)

## Tech-Stack + Standards
→ Lies docs/architecture.md (wenn vorhanden)

## Architektur-Entscheidungen
→ Lies docs/decisions.md

## Arbeitsweise
Solo-Projekt nach modus-operandi.

## Coding-Prinzipien (Karpathy-Regeln)

**1. Think Before Coding.** Annahmen explizit machen. Bei Mehrdeutigkeit Interpretationen aufzeigen statt zu raten. Wenn etwas unklar ist: stoppen und fragen. Wenn ein einfacherer Ansatz existiert: sagen.

**2. Simplicity First.** Minimum Code, der das Problem löst. Keine Features über das Gefragte hinaus. Keine Abstraktionen für Single-Use-Code.

**3. Surgical Changes.** Nur das anfassen, was nötig ist. Kein Drive-by-Refactoring. Existierenden Stil matchen.

**4. Goal-Driven Execution.** Erfolgskriterien vor Implementierung definieren. Bei Features: Akzeptanzkriterien als Checkliste.

## Coding-Konventionen
- Deutsche UI-Texte
- SQLite als Datenbank
- Python/Flask oder Next.js (wird in architecture.md festgelegt)

## Gotchas / Bekannte Fallen
- DSGVO-konforme Patienten-ID (keine Klarnamen in URLs)
- Keine medizinischen Entscheidungen automatisieren
