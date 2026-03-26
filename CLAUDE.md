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
- **Supabase service role po stronie serwera** — anon key nigdy nie używany, RLS wyłączone
