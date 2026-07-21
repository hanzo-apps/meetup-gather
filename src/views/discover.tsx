import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, H2, Text, SizableText, Paragraph, Spinner } from '@hanzo/gui'
import { warm } from '../theme'
import { Card, Pill, Avatar, AvatarStack, Stat, TextButton } from './parts'
import type { Event, Rsvp, Status } from '../lib/model'
import { STATUSES, STATUS_LABEL, guestsAt, countAt } from '../lib/model'

const STATUS_COLOR: Record<Status, string> = {
  going: warm.going,
  maybe: warm.maybe,
  cant: warm.cant,
}

/** The three-way RSVP toggle for one event; highlights the signed-in answer. */
function Rsvper({
  mine,
  busy,
  onPick,
}: {
  mine: Status | null
  busy: boolean
  onPick: (s: Status) => void
}) {
  return (
    <XStack
      backgroundColor={warm.surfaceSoft}
      borderColor={warm.borderSoft}
      borderWidth={1}
      borderRadius={999}
      padding={4}
      gap="$1"
      alignSelf="flex-start"
    >
      {STATUSES.map((s) => {
        const active = mine === s
        return (
          <TextButton
            key={s}
            label={STATUS_LABEL[s]}
            px={18}
            bg={active ? STATUS_COLOR[s] : 'transparent'}
            fg={active ? '#FFFFFF' : warm.inkSoft}
            hoverBg={active ? STATUS_COLOR[s] : '#FFFFFF'}
            disabled={busy}
            onPress={() => onPick(s)}
          />
        )
      })}
    </XStack>
  )
}

function EventCard({
  event,
  rsvps,
  me,
  busy,
  onPick,
}: {
  event: Event
  rsvps: Rsvp[]
  me: string
  busy: boolean
  onPick: (event: Event, s: Status) => void
}) {
  const going = guestsAt(rsvps, event.id, 'going')
  const mine = rsvps.find((r) => r.event === event.id && r.guest === me)?.status ?? null

  return (
    <Card padding={22}>
      <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" flexWrap="wrap">
        <YStack flex={1} minWidth={220} gap="$1.5">
          <Text color={warm.ink} fontSize={22} fontWeight="800" letterSpacing={-0.4}>
            {event.title}
          </Text>
          <SizableText color={warm.inkSoft} fontSize={14}>🗓️  {event.when}</SizableText>
          <SizableText color={warm.inkSoft} fontSize={14}>📍  {event.where}</SizableText>
        </YStack>
        <XStack alignItems="center" gap="$2">
          <Avatar name={event.host || 'Host'} size={32} />
          <YStack>
            <SizableText color={warm.inkSoft} fontSize={12}>Host</SizableText>
            <SizableText color={warm.ink} fontSize={14} fontWeight="700">{event.host}</SizableText>
          </YStack>
        </XStack>
      </XStack>

      <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$3">
        <XStack alignItems="center" gap="$3" minHeight={36}>
          {going.length > 0 ? (
            <AvatarStack names={going} size={34} max={7} />
          ) : (
            <SizableText color={warm.inkSoft} fontSize={13}>Be the first to RSVP</SizableText>
          )}
          <XStack gap="$3">
            <Stat n={going.length} label="going" color={warm.going} />
            <Stat n={countAt(rsvps, event.id, 'maybe')} label="maybe" color={warm.maybe} />
          </XStack>
        </XStack>
        <Rsvper mine={mine} busy={busy} onPick={(s) => onPick(event, s)} />
      </XStack>
    </Card>
  )
}

/**
 * RSVP + attendee list — the signed-in browse surface. Reads every meetup and
 * RSVP in your org from Base (org-scoped by the IAM token), shows who's coming,
 * and writes your own going/maybe/can't. One RSVP row per person per event:
 * update it if it exists, else create it.
 */
export function Discover({ me }: { me: string }) {
  const events = useQuery<Event>('events', { sort: '-created', realtime: false })
  const rsvps = useQuery<Rsvp>('rsvps', { sort: '-created', realtime: false })
  const create = useMutation('rsvps', 'create')
  const update = useMutation('rsvps', 'update')
  const busy = create.isLoading || update.isLoading

  async function onPick(event: Event, status: Status) {
    const mine = rsvps.data.find((r) => r.event === event.id && r.guest === me)
    if (mine) {
      if (mine.status === status) return
      await update.mutate({ id: mine.id, status })
    } else {
      await create.mutate({ event: event.id, status, guest: me })
    }
    await rsvps.refetch()
  }

  if (events.isLoading) {
    return (
      <XStack alignItems="center" gap="$2" opacity={0.6} padding="$4">
        <Spinner color={warm.brand} /> <Text color={warm.inkSoft}>Loading meetups…</Text>
      </XStack>
    )
  }

  if (events.error) {
    return (
      <Card tone="soft">
        <Paragraph color={warm.cant}>
          Couldn't reach Base ({events.error.message}). Confirm VITE_HANZO_BASE_URL and that
          you're signed in.
        </Paragraph>
      </Card>
    )
  }

  return (
    <YStack gap="$4">
      <XStack alignItems="baseline" justifyContent="space-between" flexWrap="wrap" gap="$2">
        <H2 color={warm.ink} fontSize={26} fontWeight="800" letterSpacing={-0.6}>
          Meetups in your circle
        </H2>
        <Pill color={warm.brand} fill={warm.surfaceSoft}>{events.data.length} live</Pill>
      </XStack>

      {create.error ? <Paragraph color={warm.cant}>{create.error.message}</Paragraph> : null}

      {events.data.length === 0 ? (
        <Card tone="soft" padding={28}>
          <Text fontSize={30}>🍞</Text>
          <Text color={warm.ink} fontSize={18} fontWeight="800">No meetups yet</Text>
          <Paragraph color={warm.inkSoft} fontSize={15}>
            Head to the Host tab to create the first one — a title, a time, a place. Your
            circle can RSVP the moment it's live.
          </Paragraph>
        </Card>
      ) : (
        events.data.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            rsvps={rsvps.data}
            me={me}
            busy={busy}
            onPick={onPick}
          />
        ))
      )}
    </YStack>
  )
}
