import type { BaseRecord } from '@hanzo/base/react'

/**
 * The two collections provisioned from schema.sql. Base manages
 * id/created/updated/owner/org; these interfaces add only the domain columns
 * the app reads and writes. Keep them in lockstep with schema.sql.
 */

/** A meetup. `when`/`where` are free-text (a friendly date + a place). */
export interface Event extends BaseRecord {
  title: string
  when: string
  where: string
  host: string
}

/** One person's answer to one event. `guest` is the attendee's display name. */
export interface Rsvp extends BaseRecord {
  event: string
  status: Status
  guest: string
}

export type Status = 'going' | 'maybe' | 'cant'

export const STATUSES: readonly Status[] = ['going', 'maybe', 'cant'] as const

export const STATUS_LABEL: Record<Status, string> = {
  going: 'Going',
  maybe: 'Maybe',
  cant: "Can't",
}

/** Attendee display names for one event at one status, in RSVP order. */
export function guestsAt(rsvps: Rsvp[], eventId: string, status: Status): string[] {
  return rsvps.filter((r) => r.event === eventId && r.status === status).map((r) => r.guest)
}

export function countAt(rsvps: Rsvp[], eventId: string, status: Status): number {
  return guestsAt(rsvps, eventId, status).length
}
