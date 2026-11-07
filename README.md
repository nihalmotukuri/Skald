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

Do not edit the hosted schema independently of the checked-in migrations; keeping schema changes versioned prevents drift between environments. The frontend uses Supabase Auth and Supabase tables/storage for profiles, task lists, tasks, and notes. Zustand holds authentication and UI state, while TanStack Query owns task, note, task-list, and activity data.

### Authentication configuration

The client uses Supabase Auth's PKCE flow for Google OAuth, email/password sign-in and sign-up, email confirmation, and password recovery. In Supabase Dashboard, set the production Site URL and allow the exact callback URLs used by your deployments under **Authentication → URL Configuration**:

- Local development: `http://localhost:5173/auth/callback`
- Production: `https://<your-frontend-domain>/auth/callback`

Enable the Google provider under **Authentication → Providers** and configure its Google OAuth client using the redirect URI shown by Supabase. Email sign-up and password recovery use the same callback URL; enable email confirmation and configure a production SMTP sender before opening registration to users. New and reset passwords must be at least 12 characters. Only Google is currently offered as an OAuth provider. MFA is not enabled; enabling it should be a deliberate product/security decision, with the corresponding enrollment and challenge UX configured before requiring it.

## Mr Groff assistant service

The assistant API is in `assistant-service/`. It validates Supabase access tokens against the project's JWKS endpoint and issuer, then uses the verified user's own bearer token and the publishable key to fetch RLS-scoped tasks, notes, and task lists. Gemini credentials remain in the service environment. Chat replies stream to the client as they are generated. Mr Groff can return typed create/update/delete proposals, validated against records in that user's context. The API never executes writes: the UI shows the exact proposed changes, refreshes the relevant data, and only calls the existing user-scoped Supabase mutations after the user confirms each proposal.

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

## Deployment and legacy data

The frontend is in `client/` (React, TypeScript, Vite), and Mr Groff is served by `assistant-service/` (FastAPI). The unused Express, MongoDB, and Firebase Admin API source has been removed because the client no longer calls it. This repository change does not decommission any separately hosted legacy services or delete legacy Firebase/MongoDB data; verify and disable those resources independently after confirming no other consumers remain. No legacy data migration is planned.

The previous app deployment remains available at [skald-zeta.vercel.app](https://skald-zeta.vercel.app) until its hosting configuration is changed.
