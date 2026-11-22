@AGENTS.md

# SlamSlot — wiedza o projekcie

## Co to jest

Aplikacja do zarządzania zapisami na **slamy poetyckie** — zastępuje zapisy emailowe.
Organizator tworzy slam w kilka sekund, dostaje link do wrzucenia na FB, uczestnicy się zapisują, a cały flow (lista główna / rezerwowa / powiadomienia) działa automatycznie.

## Stack

- **Next.js 16** (App Router, TypeScript) — `app/` directory, Server Components + Client Components
- **Supabase** (PostgreSQL) — baza danych, dostęp tylko przez service role key po stronie serwera
- **Resend** — emaile transakcyjne przez `lib/email.ts`
- **React Email** — szablony maili jako komponenty React w `components/emails/`
- **@dnd-kit** — drag & drop na dashboardzie organizatora
- **Tailwind CSS v4** — dark theme inspirowany slamart.pl
- **Zod** — walidacja inputów w `lib/validations.ts`
- **Sonner** — toasty (dark theme, bottom-right)

## Zmienne środowiskowe (.env.local)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=     # nigdy nie trafia do klienta
RESEND_API_KEY=
EMAIL_FROM=                    # musi być zweryfikowana domena w Resend
NEXT_PUBLIC_BASE_URL=          # bez trailing slash, np. http://localhost:3000
CRON_SECRET=                   # wymagany - bez niego crony zwracają 401
DASHBOARD_SESSION_SECRET=      # opcjonalny - do podpisu ciasteczek dashboardu (fallback: service role key)
```

## Baza danych

Schemat w `supabase-schema.sql` — uruchamiać w Supabase SQL Editor.

### Tabela `slams`
- `organizer_token` — 64-char hex, sekret organizatora (autoryzacja przez URL, wzorzec jak Doodle)
- `organizer_email` — opcjonalny, do wysyłki linków po stworzeniu slamu
- `fb_event_url` — link do wydarzenia na FB
- `image_url` — reserved, jeszcze nieużywane

### Tabela `registrations`
- `status` — `'confirmed'` lub `'waiting'`
- `position` — pozycja w ramach danego statusu (1-based)
- `waitlist_check_token` — unikalny token do strony sprawdzania pozycji
- `nickname` — kolumna w DB, ale w UI zrezygnowaliśmy z osobnego pola — jest jedno pole `name` z placeholderem "Imię, nazwisko lub pseudonim sceniczny"

### RPC `register_participant`
Atomiczna rejestracja z `FOR UPDATE` na tabeli slams — zapobiega race condition na ostatnie miejsce.

## Strony

| URL | Opis |
|---|---|
| `/` | Landing — formularz tworzenia slamu |
| `/slam/[id]` | Publiczna strona zapisów dla uczestników |
| `/slam/[id]/registered` | Potwierdzenie po zapisaniu (client component przez Suspense) |
| `/dashboard/[organizer_token]` | Dashboard organizatora — drag & drop, zarządzanie listą |
| `/waitlist/[waitlist_check_token]` | Sprawdzanie pozycji na liście rezerwowej |
| `/o-slamie` | Opis co to slam + nadchodzące slamy z Google Docs SLAM.ART.PL |

## API Routes

```
POST   /api/slams                                                  — stwórz slam
GET    /api/slams/[id]                                             — publiczne dane slamu
POST   /api/slams/[id]/register                                    — zapis uczestnika
GET    /api/dashboard/[organizer_token]                            — dane dashboardu
PATCH  /api/dashboard/[organizer_token]/registrations/[reg_id]    — przesuń uczestnika
DELETE /api/dashboard/[organizer_token]/registrations/[reg_id]    — usuń uczestnika
POST   /api/dashboard/[organizer_token]/reorder                    — zmień kolejność w liście
GET    /api/waitlist/[waitlist_check_token]                        — pozycja na liście rez.
```

## Flow maili (4 szablony + 1 dla organizatora)

Wszystkie w `components/emails/`, wysyłane przez `lib/email.ts` — fire-and-forget (błąd maila nie blokuje operacji).

| Plik | Kiedy |
|---|---|
| `organizer-email.tsx` | Po stworzeniu slamu (jeśli podał email) |
| `confirmed-email.tsx` | Natychmiast po zapisie gdy jest miejsce |
| `waitlist-email.tsx` | Natychmiast po zapisie gdy slam pełny — z linkiem do sprawdzenia pozycji |
| `promoted-email.tsx` | Gdy uczestnik awansuje z rezerwowej na główną (automatycznie lub ręcznie) |
| `moved-to-waiting-email.tsx` | Gdy organizator ręcznie przenosi na rezerwową |

## Dashboard organizatora

- Dwie kolumny: Lista główna / Lista rezerwowa
- Drag & drop **między listami** → zmiana statusu + email do uczestnika
- Drag & drop **w obrębie listy** → zmiana kolejności → `POST /api/dashboard/.../reorder`
- Przyciski ↑↓ na kartach jako alternatywa dla DnD
- Usunięcie z listy głównej → automatyczny awans pierwszej osoby z rezerwowej + email
- Hydration fix: DnD context dostaje sensory dopiero po `useEffect` (unikanie błędu aria-describedby)

## Nadchodzące slamy (/o-slamie)

Pobierane z Google Docs SLAM.ART.PL przez `lib/upcoming-slams.ts`.
- URL eksportu: `https://docs.google.com/document/d/1rvVnRo7dCsP9UzxUL7sRkuqbMnpjIMg11TCkj2UrkNE/export?format=txt`
- Format linii: `* DD.MM.RRRR, godz. HH.MM - MIASTO - Tytuł, Venue`
- Cache: `revalidate: 3600` (co godzinę)

## Decyzje projektowe

- **Brak kont** — organizator autoryzuje się przez token w URL (jak Doodle)
- **Brak osobnej kolumny nickname** — jedno pole `name` obsługuje i imię i pseudonim
- **Emails fire-and-forget** — błąd wysyłki logowany ale nie blokuje odpowiedzi API
- **Supabase service role po stronie serwera** — anon key nigdy nie używany, RLS WŁĄCZONE bez polityk (deny all dla anon) — patrz `supabase-rls-fix.sql`
- **Hasło dashboardu egzekwowane na serwerze** — `lib/dashboard-auth.ts`: każdy route `/api/dashboard/[organizer_token]/...` MUSI zaczynać się od `requireDashboard()`. Po poprawnym haśle httpOnly cookie `ss_dash_<slam_id>`. Do klienta idzie tylko `toSafeSlam()` (bez hasha i tokenu resetu)
- **Hasła: scrypt** (`lib/tokens.ts`), stare hashe HMAC podnoszone przy logowaniu
- **Rate limit** w pamięci (`lib/rate-limit.ts`) na publicznych endpointach — best effort

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
