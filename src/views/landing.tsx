import type { ReactNode } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, H2, Text, SizableText, Paragraph, ScrollView } from '@hanzo/gui'
import { warm } from '../theme'
import { Brand, Card, Pill, Avatar, AvatarGrid, AvatarStack, Stat, TextButton } from './parts'

/** A sample crowd for the featured event's "who's coming" wall. */
const CROWD = [
  'Maya Okonkwo', 'Theo Alvarez', 'Priya Nair', 'Sam Osei', 'Lena Voss', 'Diego Fuentes',
  'Aiko Tanaka', 'Noor Haddad', 'Ruben Cole', 'Ingrid Bauer', 'Tomas Rivas', 'Yara Salem',
  'Nils Berg', 'Farida Aziz', 'Ollie Grant', 'Zeynep Kaya', 'Mateo Ricci', 'Hana Park',
  'Cyrus Ford', 'Amara Diallo', 'Kai Lindqvist',
]

/** A couple of nearby meetups to browse under the hero. */
const NEARBY = [
  { title: 'Tuesday Trail Run + Tacos', when: 'Tue · 6:30pm', where: 'Dolores Park gate', tag: 'Outdoors', crowd: CROWD.slice(3, 12) },
  { title: 'First-Draft Writers Circle', when: 'Thu · 7:00pm', where: 'Bernal Library', tag: 'Craft', crowd: CROWD.slice(8, 15) },
  { title: 'Vinyl & Natural Wine', when: 'Fri · 8:00pm', where: 'The Back Room', tag: 'Nightlife', crowd: CROWD.slice(1, 17) },
]

function MetaRow({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <XStack alignItems="center" gap="$2.5">
      <YStack
        width={38}
        height={38}
        borderRadius={12}
        backgroundColor={warm.surfaceSoft}
        borderWidth={1}
        borderColor={warm.borderSoft}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={17}>{icon}</Text>
      </YStack>
      <SizableText color={warm.ink} fontSize={15} fontWeight="600">
        {children}
      </SizableText>
    </XStack>
  )
}

/**
 * Event landing — the public, pre-auth face of Gather. It markets the product
 * and *is* the event-landing surface: a real meetup page with host, details, and
 * a live "who's coming" wall. Every call to action opens Hanzo sign-in (PKCE).
 */
export function Landing() {
  const { login, isLoading } = useIam()
  const going = CROWD.slice(0, 21)

  return (
    <ScrollView flex={1} backgroundColor={warm.page}>
      <YStack width="100%" maxWidth={980} alignSelf="center" paddingHorizontal="$4" paddingBottom={72} gap="$7">
        {/* top bar */}
        <XStack alignItems="center" justifyContent="space-between" paddingVertical="$4">
          <Brand />
          <XStack alignItems="center" gap="$2">
            <TextButton
              label="Sign in"
              fg={warm.ink}
              hoverBg={warm.surfaceSoft}
              disabled={isLoading}
              onPress={() => login()}
            />
            <TextButton
              label="Host a meetup"
              bg={warm.ink}
              fg="#FFFFFF"
              hoverBg="#443528"
              disabled={isLoading}
              onPress={() => login()}
            />
          </XStack>
        </XStack>

        {/* headline */}
        <YStack alignItems="center" gap="$4" paddingTop="$2">
          <Pill color={warm.brand} fill={warm.surfaceSoft}>◍ Community meetups, made warm</Pill>
          <H1
            textAlign="center"
            color={warm.ink}
            fontSize={54}
            lineHeight={56}
            fontWeight="900"
            letterSpacing={-1.5}
            maxWidth={720}
          >
            Find your people.{' '}
            <Text color={warm.brand} fontSize={54} fontWeight="900" letterSpacing={-1.5}>
              Gather.
            </Text>
          </H1>
          <Paragraph textAlign="center" color={warm.inkSoft} fontSize={18} lineHeight={27} maxWidth={560}>
            Spin up a meetup page in a minute. Friends RSVP, everyone sees who's coming,
            and the details live in one warm, simple place.
          </Paragraph>
        </YStack>

        {/* featured event card — the star */}
        <Card padding={28}>
          <XStack flexWrap="wrap" gap="$5" justifyContent="space-between">
            {/* left: the meetup */}
            <YStack flex={1} minWidth={300} gap="$4">
              <XStack gap="$2" flexWrap="wrap">
                <Pill color={warm.brand}>Featured</Pill>
                <Pill color={warm.going} fill="rgba(46,158,91,0.12)">This Sunday</Pill>
              </XStack>
              <H2 color={warm.ink} fontSize={32} lineHeight={36} fontWeight="800" letterSpacing={-0.8}>
                Sunday Sourdough &amp; Slow Coffee
              </H2>
              <YStack gap="$2.5">
                <MetaRow icon="🗓️">Sunday, 10:00am – 12:30pm</MetaRow>
                <MetaRow icon="📍">The Mission Commons · 21st &amp; Bryant</MetaRow>
              </YStack>
              <XStack alignItems="center" gap="$2.5" paddingTop="$1">
                <Avatar name="Maya Okonkwo" size={40} />
                <YStack>
                  <SizableText color={warm.ink} fontSize={14} fontWeight="700">
                    Hosted by Maya Okonkwo
                  </SizableText>
                  <SizableText color={warm.inkSoft} fontSize={13}>
                    Baker, neighbor, chronic over-inviter
                  </SizableText>
                </YStack>
              </XStack>
              <Paragraph color={warm.inkSoft} fontSize={15} lineHeight={23}>
                Bring a starter or just your appetite. We'll pull warm loaves at 10, brew a
                slow pour-over, and trade tips on the patio. All levels, all welcome.
              </Paragraph>
            </YStack>

            {/* right: who's coming + RSVP */}
            <YStack width={340} minWidth={280} flex={1} gap="$4">
              <Card tone="soft" padding={20}>
                <XStack alignItems="center" justifyContent="space-between">
                  <Text color={warm.ink} fontSize={15} fontWeight="800">
                    Who's coming
                  </Text>
                  <XStack gap="$3">
                    <Stat n={21} label="going" color={warm.going} />
                    <Stat n={8} label="maybe" color={warm.maybe} />
                  </XStack>
                </XStack>
                <AvatarGrid names={going} size={44} ring={warm.surfaceSoft} />
              </Card>
              <TextButton
                label={isLoading ? 'Opening…' : "RSVP — I'm in"}
                size="$5"
                bg={warm.brand}
                fg="#FFFFFF"
                hoverBg={warm.brandDeep}
                radius={16}
                weight="800"
                fontSize={16}
                elevated
                disabled={isLoading}
                onPress={() => login()}
              />
              <SizableText textAlign="center" color={warm.inkSoft} fontSize={13}>
                Free · Sign in with Hanzo to save your spot
              </SizableText>
            </YStack>
          </XStack>
        </Card>

        {/* nearby meetups */}
        <YStack gap="$4">
          <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$2">
            <H2 color={warm.ink} fontSize={24} fontWeight="800" letterSpacing={-0.5}>
              More meetups near you
            </H2>
            <SizableText color={warm.inkSoft} fontSize={14}>
              Sign in to RSVP or start your own
            </SizableText>
          </XStack>
          <XStack flexWrap="wrap" gap="$4">
            {NEARBY.map((m) => (
              <YStack key={m.title} flex={1} minWidth={260}>
                <Card padding={20}>
                  <Pill color={warm.brand}>{m.tag}</Pill>
                  <Text color={warm.ink} fontSize={19} fontWeight="800" letterSpacing={-0.3}>
                    {m.title}
                  </Text>
                  <YStack gap="$1.5">
                    <SizableText color={warm.inkSoft} fontSize={14}>🗓️  {m.when}</SizableText>
                    <SizableText color={warm.inkSoft} fontSize={14}>📍  {m.where}</SizableText>
                  </YStack>
                  <XStack alignItems="center" justifyContent="space-between" paddingTop="$2">
                    <AvatarStack names={m.crowd} size={32} max={5} />
                    <Text color={warm.going} fontSize={13} fontWeight="700">
                      {m.crowd.length} going
                    </Text>
                  </XStack>
                </Card>
              </YStack>
            ))}
          </XStack>
        </YStack>

        {/* footer */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap="$3"
          paddingTop="$5"
          borderTopWidth={1}
          borderColor={warm.border}
        >
          <Brand size="sm" />
          <SizableText color={warm.inkSoft} fontSize={13}>
            Real pages · Real RSVPs · Your people, gathered
          </SizableText>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
