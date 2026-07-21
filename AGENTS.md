# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Meetup Gather — warm community meetup pages with RSVPs. Vite + React 19 +
`@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. Three views: event landing (public),
Discover (RSVP + attendee list), Host dashboard. Keep it minimal and real.
`@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this); `Button`
takes no text props, so style labels via the shared `TextButton`. `schema.sql`
(events + rsvps) is the Base data contract — keep it in lockstep with
`src/lib/model.ts`. Prove changes with `npm run build` (tsc + vite). Never build
a container image locally — Hanzo Cloud owns deploys.
