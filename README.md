# Meetup Gather

Warm community meetup pages with RSVPs — a real, buildable Hanzo app you fork on
[hanzo.app](https://hanzo.app) and deploy live on Hanzo Cloud.

Spin up a meetup page in a minute: pick a title, a time, a place. Your circle
RSVPs going / maybe / can't, everyone sees who's coming as a wall of attendee
avatars, and the details live in one warm, simple place.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. 100% gui primitives — no Tailwind, no
  second kit. Warm, rounded, community look.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. Events and RSVPs are real Base collections.

## Three views

| View | Who | What |
| --- | --- | --- |
| **Event landing** | public (pre-auth) | A featured meetup page — host, details, a live "who's coming" wall — plus nearby meetups. Every RSVP opens Hanzo sign-in. |
| **Discover (RSVP + attendee list)** | signed in | Every meetup in your org. See who's going and set your own going / maybe / can't. |
| **Host dashboard** | signed in | Publish a meetup (you become the host) and watch the RSVPs roll up. |

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `react-native-web` | `^0.21.0` |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the landing + sign-in flow. Copy `.env.example` to `.env`
to point at a different environment.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_HANZO_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy's `/auth/callback` — see **Ambient IAM**. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |
| `VITE_HANZO_API_URL` / `VITE_HANZO_API_KEY` | Optional — only if the app calls the Hanzo LLM gateway. Unused here; never commit a real key. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base. "Ambient" means the app just reads the signed-in user via that token.

The one deploy requirement: the IAM client (`VITE_HANZO_CLIENT_ID`) must list
this origin's `/auth/callback` as an allowed redirect URI. Register a
`https://*.hanzo.app/auth/callback` wildcard on the shared client so every
forked app works, or register a dedicated `hanzo-<app>` client per app.

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base manages
`id`/`created`/`updated`/`owner`/`org`, stamps `owner`+`org` from the verified
IAM principal, and scopes every row to the caller's org under the rule
`@request.auth.org_id = org` — a teammate in your org sees the row; other orgs
cannot. Two collections back the app:

- **events** — `title`, `when`, `where`, `host`
- **rsvps** — `event`, `status` (going | maybe | cant), `guest`

At runtime `src/views/discover.tsx` and `src/views/host.tsx` read/write those
collections through `@hanzo/base/react` (`useQuery`/`useMutation`) carrying the
IAM token. Keep `schema.sql` in lockstep with `src/lib/model.ts`.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the app compiles green.

## Layout

```
src/
  main.tsx          entry
  providers.tsx     GuiProvider(light) -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx           route (/auth/callback) + auth gate (Landing / Home)
  gui.config.ts     createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts     IAM PKCE config
  env.ts            the VITE_ env contract, one place
  theme.ts          the warm palette + avatar helpers, one place
  lib/base.ts       BaseClient carrying the IAM bearer token
  lib/model.ts      Event + Rsvp types (lockstep with schema.sql)
  auth/callback.tsx PKCE return leg
  views/
    parts.tsx       shared @hanzo/gui primitives (Brand, Avatar, Card, TextButton…)
    landing.tsx     event landing (public)
    home.tsx        signed-in shell (Discover / Host tabs)
    discover.tsx    RSVP + attendee list
    host.tsx        host dashboard (create + rollup)
schema.sql          databaseSchema -> Base collections on publish
hanzo.yml           Hanzo Cloud build/deploy manifest
```
