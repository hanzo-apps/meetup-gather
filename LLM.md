# meetup-gather — agent notes

Meetup Gather: warm community meetup pages with RSVPs. A real Hanzo app forked
from the canonical `hanzo-starter`. Vite + React 19 + `@hanzo/gui` (UI) +
`@hanzo/iam` (auth) + `@hanzo/base` (data). Keep it minimal and REAL — every
surface builds and runs, no fabricated UI.

## What it is

Three views, one static SPA:

- **Event landing** (`views/landing.tsx`) — public, pre-auth. A featured meetup
  page (host, details, a live "who's coming" avatar wall) + nearby meetups.
  Every CTA calls `login()`.
- **Discover** (`views/discover.tsx`) — signed in, RSVP + attendee list. Reads
  every `events` + `rsvps` row in your org, shows who's going, writes your own
  going/maybe/cant (one RSVP row per person per event: update if it exists, else
  create).
- **Host** (`views/host.tsx`) — signed in, dashboard. Publishes an event
  (stamped with you as `host`) and rolls up its RSVPs.

`views/home.tsx` is the signed-in shell that tab-switches Discover/Host and
threads `me` (your display name) down. `app.tsx` gates: `/auth/callback` →
`Callback`, signed-out → `Landing`, signed-in → `Home`.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user. Gather fixes the
  **light** theme for its warm look.
- **Env is one place** (`src/env.ts`); **color is one place** (`src/theme.ts`);
  **the data shape is one place** (`src/lib/model.ts`, lockstep with `schema.sql`).
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). Shared presentational parts live in `views/parts.tsx`.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line): (1) alias `react-native` → `react-native-web`, (2) `define`
  `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`, (3) `dedupe`
  react/react-dom/react-native-web. No Tamagui compiler, no `one`, no Expo.
- **`@hanzo/gui` props are Tamagui LONGHAND**: `alignItems`/`justifyContent`/
  `backgroundColor`/`padding`/`alignSelf`/`borderRadius`/`textAlign` — NOT the
  `items`/`justify`/`bg`/`p`/`self`/`rounded`/`text` shorthands. Shorthands pass
  at runtime but FAIL `tsc`.
- **`Button` is a styled stack, not a text element.** It takes stack props
  (`backgroundColor`/`borderRadius`/`padding`/`hoverStyle`) but NOT `color` /
  `fontWeight` / `fontSize` — those fail `tsc`. Style the label with a nested
  `<Text>`. This is decomplected into the single `TextButton` in `parts.tsx`;
  route every button through it. `Input` uses `value`/`onChangeText` and its
  `placeholderTextColor` wants a `ColorTokens`, not a hex — so it is left default.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** `when`/`where` are SQL keywords, quoted
  as identifiers in the DDL; the app reads them as plain fields. Keep it in
  lockstep with `src/lib/model.ts`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage. No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the `events` +
  `rsvps` collections (org-scoped, rule `@request.auth.org_id = org`). Runtime
  read/write is browser → `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback` (`https://*.hanzo.app/auth/callback` wildcard, or a per-app
  `hanzo-meetup-gather` client).

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
