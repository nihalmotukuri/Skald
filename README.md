# Skald

Skald is a personal productivity workspace for tasks, notes, and focused planning. The refresh keeps its dark, atmospheric identity while improving the product's usability, accessibility, and performance.

## Rejuvenation architecture

- **Supabase Auth, Postgres, and Storage** are the target for new accounts and application data.
- **No legacy data migration is planned.** Existing Firebase and MongoDB data is out of scope and remains untouched.
- **Zustand** holds client authentication and UI state; **TanStack Query** manages Supabase task, note, task-list, and activity data.
- **FastAPI** powers Mr Groff, Skald's AI assistant. It verifies Supabase user tokens, keeps model credentials server-side, and never applies task or note changes.
- Ordinary task and note operations will use Supabase's Data API with Row Level Security (RLS).

## Supabase setup and migrations

Create `client/.env` from the safe template in `client/.env.example` and fill in the Supabase project URL and publishable key. Never put a Supabase secret/service-role key or an AI provider key in a `VITE_` variable.

```sh
cp client/.env.example client/.env
```

The Supabase CLI configuration and versioned SQL migrations live in `supabase/`. The initial schema migration was applied from the Supabase Dashboard SQL Editor. The Dashboard does not register that execution in the CLI migration history, so link the project and mark that migration as applied before using `supabase db push` for future changes:

```sh
supabase login
supabase link --project-ref <project-ref>
supabase migration repair --status applied --remote 20261107100000
supabase migration list --remote
```

Review the linked project and migration list before pushing. Use a separate development project to validate future schema changes before applying them to production. New migrations can then be applied with:

```sh
supabase db push
```

The initial migration creates profiles, task lists, tasks, notes, a private note-image bucket, and user-scoped RLS policies. It does not migrate or modify the legacy MongoDB database.

Do not edit the hosted schema independently of the checked-in migrations; keeping schema changes versioned prevents drift between environments. The frontend now uses Supabase Auth and Supabase tables/storage for profiles, task lists, tasks, and notes. Zustand holds authentication and UI state, while TanStack Query owns task, note, task-list, and activity data. The legacy Express/Firebase Admin API is still present but no longer used for those client data flows.

## Mr Groff assistant service

The assistant API is in `assistant-service/`. It validates Supabase access tokens against the project's JWKS endpoint and issuer, then uses the verified user's own bearer token and the publishable key to fetch RLS-scoped tasks, notes, and task lists. Gemini credentials remain in the service environment; the API does not expose a mutation tool, so it cannot change user data.

For local development, create the service environment from its template, add the Supabase project values and server-side Gemini API key, then start the service:

```sh
cp assistant-service/.env.example assistant-service/.env
cd assistant-service
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Set `VITE_ASSISTANT_API_URL` in `client/.env` to the service URL (the example uses `http://localhost:8000`). Remove any old `VITE_GEMINI_KEY` from the client environment; configure `GEMINI_API_KEY` only in the assistant service. If a Gemini key was previously shipped in a browser build, rotate it in Google AI Studio. Set `CORS_ORIGINS` to the exact deployed frontend origin(s) in production. Run service tests with `pip install -r requirements-dev.txt && pytest`.

## Existing application

The current frontend is in `client/` (React, TypeScript, Vite), and the legacy API is in `server/` (Express, MongoDB, Firebase Admin). The live legacy app is available at [skald-zeta.vercel.app](https://skald-zeta.vercel.app).
