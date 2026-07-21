-- Hanzo Base schema for Meetup Gather (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped under the access rule `@request.auth.org_id = org` — members of
-- your org read/write it; other orgs cannot see it.
--
-- Keep this file in lockstep with what the app reads/writes
-- (src/lib/model.ts · src/views/discover.tsx · src/views/host.tsx).

-- A meetup. `when` and `where` are SQL keywords, so they are quoted as
-- identifiers; the app reads them as plain fields (event.when / event.where).
CREATE TABLE IF NOT EXISTS events (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  title   TEXT NOT NULL,
  "when"  TEXT NOT NULL,
  "where" TEXT NOT NULL,
  host    TEXT NOT NULL
);

-- One attendee's answer to one event. `status` is going | maybe | cant,
-- `guest` is the attendee's display name, `event` references events.id.
CREATE TABLE IF NOT EXISTS rsvps (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  event  TEXT NOT NULL,
  status TEXT NOT NULL,
  guest  TEXT NOT NULL
);
