# Skald

Skald is a personal productivity workspace for planning your day, organizing tasks and notes, and working with Mr Groff, an AI assistant. The web app is built with React and TypeScript; Supabase provides authentication, data, and storage.

## What’s included

- **Today and tasks:** Review upcoming work, create tasks, assign priorities and due dates, and organize tasks into lists.
- **Notes:** Create and organize notes with formatting, images, pinning, colors, and reminders.
- **Mr Groff:** Chat with an assistant that can propose task and note changes. Review each proposal and explicitly confirm it before it is applied.
- **Accounts:** Sign in with Google or email and password, confirm email, and recover a password.
- **Private data:** Supabase Row Level Security scopes app data and files to the signed-in user.

## Technology

- **Web:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, and Zustand.
- **Data and authentication:** Supabase Auth, Postgres, and Storage.
- **Assistant API:** FastAPI and Gemini.
- **Hosting:** The client includes a Vercel SPA rewrite in `client/vercel.json`. Deploy the assistant API separately.

## Repository layout

```text
client/
  src/                    React application
  supabase/
    migrations/           Versioned database and storage migrations
assistant-service/
  app/                    FastAPI application
  tests/                  Assistant API tests
README.md
```

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` and npm
- Python 3.10 or later
- A Supabase project
- A Gemini API key to use Mr Groff
- Supabase CLI only if you need to run or manage database migrations

## Configure Supabase

The client uses Supabase Auth with the PKCE flow and accesses Supabase tables and storage directly using the signed-in user's session.

1. Create a Supabase project.
2. For a new project, apply the migrations in `client/supabase/migrations/` in timestamp order, or use the Supabase CLI migration workflow below. If you are connecting an existing project, check its migration history first; do not blindly rerun migrations in the SQL Editor.
3. Configure the authentication providers you want to offer under **Authentication → Providers**. Google sign-in requires a Google OAuth client configured with the callback URL provided by Supabase.
4. Under **Authentication → URL Configuration**, set the Site URL and allow the callback URL(s) used by the app:

   - `http://localhost:5173/auth/callback`
   - `http://127.0.0.1:5173/auth/callback`
   - `https://<your-frontend-domain>/auth/callback`

   Add only the URLs that apply to your environments. Email confirmation and password recovery also return through the callback flow. Configure a production SMTP sender before enabling registration for production users.

The migrations create user-scoped policies and private storage buckets for note images and assistant attachments. Do not expose a Supabase secret or service-role key in the client.

### Applying migrations with the Supabase CLI

The Supabase CLI project and migrations are under `client/supabase/`; run CLI commands from `client/`.

```sh
cd client
supabase login
supabase link --project-ref <project-ref>
supabase migration list --remote
```

Review the linked project and its migration history before making schema changes. The initial schema migration (`20261107100000`) was previously applied through the Supabase Dashboard SQL Editor, which does not automatically record it in the CLI migration history. If the remote history does not show it as applied, reconcile that migration before pushing:

```sh
supabase migration repair --status applied --remote 20261107100000
supabase migration list --remote
```

After confirming the intended project and reconciling its history, apply any remaining migrations:

```sh
supabase db push
```

Use a separate development project to validate schema changes before applying them to production. Avoid editing the hosted schema outside the versioned migrations.

To run a local Supabase stack, install Docker and the Supabase CLI, then run `supabase start` from `client/`. Use `supabase db reset` to recreate the local database and apply its migrations; this command resets local data.

## Run locally

### 1. Configure the web client

```sh
cd client
cp .env.example .env
```

Set the following values in `client/.env`:

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
VITE_ASSISTANT_API_URL=http://localhost:8000
```

Install dependencies and start Vite:

```sh
npm install
npm run dev
```

The app is available at `http://localhost:5173`. If using local Supabase, start it from `client/` with `supabase start`, then use the API URL and publishable key reported by `supabase status` instead.

### 2. Configure and run the assistant API

In another terminal:

```sh
cd assistant-service
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set the service values in `assistant-service/.env`:

```dotenv
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
SUPABASE_JWKS_URL=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
GEMINI_API_KEY=<server-side-gemini-api-key>
GEMINI_MODEL=gemini-3.5-flash
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Start the API:

```sh
uvicorn app.main:app --reload
```

The service listens at `http://localhost:8000`; its health endpoint is `http://localhost:8000/health`. Keep `GEMINI_API_KEY` only in the assistant service environment—never in a `VITE_` variable. The client sends the user's IANA timezone so the assistant can interpret task times in local time.

## Checks

Build and lint the client:

```sh
cd client
npm run build
npm run lint
```

Run the assistant-service tests:

```sh
cd assistant-service
source .venv/bin/activate
pip install -r requirements-dev.txt
PYTHONPATH=. pytest -q
```

## Deployment

### Web client

Deploy `client/` as the Vercel project root. Configure these environment variables for each deployment environment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ASSISTANT_API_URL` — the public HTTPS base URL of the deployed assistant API

The Vercel rewrite in `client/vercel.json` sends app routes to `index.html`.

### Assistant API

Deploy `assistant-service/` as a separate Python service. Configure:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_JWKS_URL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional; defaults to `gemini-3.5-flash`)
- `CORS_ORIGINS` — comma-separated frontend origins, with no paths

Install `assistant-service/requirements.txt` and start the service with:

```sh
uvicorn app.main:app --host 0.0.0.0 --port <platform-port>
```

Configure the host's health check to call `/health`. In Supabase Auth URL Configuration, set the production Site URL and allow the production `/auth/callback` URL. Keep the Gemini key and any Supabase secret/service-role keys out of browser-exposed environment variables.

## How assistant actions work

The API verifies the Supabase access token, then loads task, note, and list context using that user's token and the Supabase publishable key. It sends the request to Gemini and returns structured proposals. The assistant API does not write task or note data: the client displays proposals, refreshes the current records, and performs a user-scoped Supabase mutation only after the user confirms.

## Legacy services and data

This app uses Supabase for its current authentication and application data. No Firebase or MongoDB data migration is included. Removing legacy code from this repository does not decommission separately hosted services or remove their data; verify there are no other consumers before disabling those resources.
