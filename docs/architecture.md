# architecture.md — Praxis Demir & Kollegen

_Stand: 03.07.2026_

## Tech-Stack

| Komponente | Technologie |
|---|---|
| Frontend | Next.js (React, TypeScript) |
| Backend | Next.js API Routes |
| Datenbank | SQLite (via Prisma ORM) |
| ORM | Prisma |

## Begründung

- **Next.js** — empfohlener Standard im Kurs, React-basiert, Codex baut es flüssig, läuft sauber lokal.
- **SQLite** — eine Datei, kein Server, null Setup, sofort lauffähig. Wechsel zu Postgres später via Prisma eine Zeile.
- **Prisma** — Typensicherer ORM, generiert TypeScript-Types aus dem Schema.

## Datenbank

- Provider: SQLite
- Datei: `prisma/dev.db` (wird automatisch angelegt)
- Schema: `prisma/schema.prisma`

## Ordnerstruktur

```
├── app/              # Next.js App Router (Seiten + API Routes)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/              # Hilfsfunktionen
│   └── prisma.ts     # Prisma-Client Singleton
├── prisma/
│   └── schema.prisma # Datenbank-Schema
├── docs/             # Projektdokumentation
│   ├── spec.md
│   ├── backlog.md
│   ├── decisions.md
│   └── architecture.md
├── AGENTS.md
└── package.json
```
