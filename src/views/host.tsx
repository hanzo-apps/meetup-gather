import { useState } from 'react'
import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, H2, Text, SizableText, Paragraph, Input, Spinner } from '@hanzo/gui'
import { warm } from '../theme'
import { Card, Pill, AvatarStack, Stat, TextButton, withAlpha } from './parts'
import type { Event, Rsvp } from '../lib/model'
import { countAt, guestsAt } from '../lib/model'

function Field({
  label,
  placeholder,
  value,
  onChange,
  flex,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  flex?: number
}) {
  return (
    <YStack gap="$1.5" flex={flex} minWidth={180}>
      <SizableText color={warm.inkSoft} fontSize={13} fontWeight="700">{label}</SizableText>
      <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        backgroundColor={warm.surface}
        borderColor={warm.border}
        borderWidth={1}
        borderRadius={12}
        color={warm.ink}
        height={46}
        focusStyle={{ borderColor: warm.brand }}
      />
    </YStack>
  )
}

function HostedCard({
  event,
  rsvps,
  busy,
  onDelete,
}: {
  event: Event
  rsvps: Rsvp[]
  busy: boolean
  onDelete: (id: string) => void
}) {
  const going = guestsAt(rsvps, event.id, 'going')
  return (
    <Card padding={20}>
      <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" flexWrap="wrap">
        <YStack flex={1} minWidth={200} gap="$1.5">
          <Text color={warm.ink} fontSize={20} fontWeight="800" letterSpacing={-0.4}>{event.title}</Text>
          <SizableText color={warm.inkSoft} fontSize={14}>🗓️  {event.when}</SizableText>
          <SizableText color={warm.inkSoft} fontSize={14}>📍  {event.where}</SizableText>
        </YStack>
        <TextButton
          label="Remove"
          size="$2"
          fg={warm.cant}
          hoverBg={withAlpha(warm.cant, 0.1)}
          radius={10}
          px={12}
          disabled={busy}
          onPress={() => onDelete(event.id)}
        />
      </XStack>
      <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$3">
        <XStack alignItems="center" gap="$3" minHeight={34}>
          {going.length > 0 ? (
            <AvatarStack names={going} size={32} max={8} />
          ) : (
            <SizableText color={warm.inkSoft} fontSize={13}>No RSVPs yet</SizableText>
          )}
        </XStack>
        <XStack gap="$4">
          <Stat n={going.length} label="going" color={warm.going} />
          <Stat n={countAt(rsvps, event.id, 'maybe')} label="maybe" color={warm.maybe} />
          <Stat n={countAt(rsvps, event.id, 'cant')} label="can't" color={warm.cant} />
        </XStack>
      </XStack>
    </Card>
  )
}

/**
 * Host dashboard — the signed-in create + manage surface. Publishes a meetup to
 * Base (stamped with you as host) and rolls up its RSVPs. Shows only the meetups
 * you host; delete pulls a meetup down.
 */
export function Host({ me }: { me: string }) {
  const events = useQuery<Event>('events', { sort: '-created', realtime: false })
  const rsvps = useQuery<Rsvp>('rsvps', { sort: '-created', realtime: false })
  const create = useMutation('events', 'create')
  const remove = useMutation('events', 'delete')

  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('')
  const [where, setWhere] = useState('')
  const ready = title.trim() && when.trim() && where.trim()

  const mine = events.data.filter((e) => e.host === me)
  const totalGoing = mine.reduce((n, e) => n + countAt(rsvps.data, e.id, 'going'), 0)

  async function publish() {
    if (!ready || create.isLoading) return
    await create.mutate({
      title: title.trim(),
      when: when.trim(),
      where: where.trim(),
      host: me,
    })
    setTitle('')
    setWhen('')
    setWhere('')
    await events.refetch()
  }

  async function onDelete(id: string) {
    await remove.mutate({ id })
    await events.refetch()
    await rsvps.refetch()
  }

  return (
    <YStack gap="$4">
      <XStack alignItems="baseline" justifyContent="space-between" flexWrap="wrap" gap="$2">
        <H2 color={warm.ink} fontSize={26} fontWeight="800" letterSpacing={-0.6}>Your meetups</H2>
        {mine.length > 0 ? (
          <Pill color={warm.going} fill={withAlpha(warm.going, 0.12)}>{totalGoing} coming across {mine.length}</Pill>
        ) : null}
      </XStack>

      {/* create */}
      <Card tone="soft" padding={22}>
        <Text color={warm.ink} fontSize={17} fontWeight="800">Start a meetup</Text>
        <Field label="What is it?" placeholder="Sunday Sourdough & Slow Coffee" value={title} onChange={setTitle} />
        <XStack gap="$3" flexWrap="wrap">
          <Field label="When" placeholder="Sunday · 10:00am" value={when} onChange={setWhen} flex={1} />
          <Field label="Where" placeholder="The Mission Commons" value={where} onChange={setWhere} flex={1} />
        </XStack>
        {create.error ? <Paragraph color={warm.cant}>{create.error.message}</Paragraph> : null}
        <TextButton
          label={create.isLoading ? 'Publishing…' : 'Publish meetup'}
          size="$4"
          bg={warm.brand}
          fg="#FFFFFF"
          hoverBg={warm.brandDeep}
          radius={14}
          px={22}
          weight="800"
          fontSize={15}
          alignSelf="flex-start"
          disabled={!ready || create.isLoading}
          onPress={publish}
        />
      </Card>

      {/* hosted list */}
      {events.isLoading ? (
        <XStack alignItems="center" gap="$2" opacity={0.6} padding="$3">
          <Spinner color={warm.brand} /> <Text color={warm.inkSoft}>Loading…</Text>
        </XStack>
      ) : events.error ? (
        <Paragraph color={warm.cant}>Couldn't reach Base ({events.error.message}).</Paragraph>
      ) : mine.length === 0 ? (
        <Paragraph color={warm.inkSoft} fontSize={15} paddingHorizontal="$1">
          Nothing hosted yet. Publish your first meetup above — it goes live for your circle instantly.
        </Paragraph>
      ) : (
        <YStack gap="$3">
          {mine.map((event) => (
            <HostedCard
              key={event.id}
              event={event}
              rsvps={rsvps.data}
              busy={remove.isLoading}
              onDelete={onDelete}
            />
          ))}
        </YStack>
      )}
    </YStack>
  )
}
