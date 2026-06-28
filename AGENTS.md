# AI Resume Studio

## Tech Stack

- **Next.js 16** (App Router) + TypeScript strict
- **Prisma 7** with `@prisma/adapter-libsql` (SQLite via libsql) — NOT the traditional Prisma setup
- **Tailwind CSS 4** (not v3 — uses `@import "tailwindcss"` syntax, no `tailwind.config.js`)
- **OpenAI SDK v6** for AI features

## Critical Setup

### Prisma 7 + SQLite (unusual setup)

- Datasource URL is in `prisma.config.ts`, NOT in `schema.prisma`
- PrismaClient requires the `@prisma/adapter-libsql` adapter — see `src/lib/prisma.ts`
- Schema has no `url` property in `datasource db` block
- After changing schema: `npx prisma migrate dev --name <name>`
- Generate client: `npx prisma generate` (requires `prisma.config.ts` to find datasource)

### Environment Variables

Required in `.env`:
- `DATABASE_URL` — defaults to `file:./dev.db` (SQLite)
- `OPENAI_API_KEY` — required for AI analysis features

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (typecheck + compile)
npm run lint         # ESLint
npx prisma migrate dev --name <name>  # Create migration
npx prisma generate  # Regenerate client after schema changes
```

**Build order**: TypeScript check runs automatically during `npm run build`. No separate typecheck command.

## Architecture

```
src/
├── app/
│   ├── api/           # Route handlers (upload, analyze, match, cover-letter, reports)
│   ├── upload/        # Resume upload page
│   ├── analysis/[id]/ # Results dashboard
│   └── pricing/       # Pricing page
├── lib/
│   ├── ai/            # OpenAI integration, prompts, pipeline
│   ├── parser/        # PDF/DOCX extraction
│   ├── scoring/       # ATS score, job match, hiring probability
│   └── prisma.ts      # Prisma client singleton
├── types/resume.ts    # Zod schemas + TypeScript types
└── constants/         # Weights, limits, AI model configs
```

## Key Conventions

- AI outputs use **structured JSON** with Zod validation — never raw text
- Scoring is deterministic (weighted formulas in `src/lib/scoring/`), not LLM-based
- Prisma stores JSON as strings (`parsedData`, `optimizedResume`, etc.) — parse with `JSON.parse()`
- All API routes return NextResponse with JSON body
- Frontend uses dark-mode-first design with CSS variables in `globals.css`

## Gotchas

- `pdf-parse` v2 exports `PDFParse` class (not default function) — see `src/lib/parser/index.ts`
- Prisma 7 types: `PrismaClient` constructor requires `{ adapter }` — bare `new PrismaClient()` fails at runtime
- OpenAI streaming types: `delta.content` may be `Uint8Array` — cast with `String()` before `encoder.encode()`
- SQLite file lives at `prisma/dev.db` — not created until first migration
