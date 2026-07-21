import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, Text, SizableText, ScrollView } from '@hanzo/gui'
import { warm } from '../theme'
import { Brand, Avatar, TextButton } from './parts'
import { Discover } from './discover'
import { Host } from './host'

type Tab = 'discover' | 'host'

const TABS: { id: Tab; label: string }[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'host', label: 'Host' },
]

/**
 * Signed-in shell: brand + a two-tab switch (Discover = RSVP/attendees, Host =
 * create/manage) + who you are. No router — one static SPA, tab state in React.
 * `me` (your display name) is derived once here and threaded to both surfaces.
 */
export function Home() {
  const { user, logout } = useIam()
  const me = user?.displayName || user?.name || user?.email || 'You'
  const [tab, setTab] = useState<Tab>('discover')

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={warm.page}>
      {/* header */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap="$3"
        paddingHorizontal="$5"
        paddingVertical="$3"
        backgroundColor={warm.surface}
        borderBottomWidth={1}
        borderColor={warm.border}
      >
        <Brand />

        <XStack
          backgroundColor={warm.surfaceSoft}
          borderColor={warm.borderSoft}
          borderWidth={1}
          borderRadius={999}
          padding={4}
          gap="$1"
        >
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <TextButton
                key={t.id}
                label={t.label}
                px={22}
                bg={active ? warm.brand : 'transparent'}
                fg={active ? '#FFFFFF' : warm.inkSoft}
                hoverBg={active ? warm.brand : '#FFFFFF'}
                onPress={() => setTab(t.id)}
              />
            )
          })}
        </XStack>

        <XStack alignItems="center" gap="$2.5">
          <Avatar name={me} size={32} ring={warm.surface} />
          <YStack>
            <SizableText color={warm.inkSoft} fontSize={12}>Signed in</SizableText>
            <Text color={warm.ink} fontSize={14} fontWeight="700">{me}</Text>
          </YStack>
          <TextButton
            label="Sign out"
            size="$2"
            fg={warm.inkSoft}
            hoverBg={warm.surfaceSoft}
            radius={10}
            px={12}
            onPress={() => logout()}
          />
        </XStack>
      </XStack>

      {/* body */}
      <ScrollView flex={1}>
        <YStack width="100%" maxWidth={780} alignSelf="center" paddingHorizontal="$4" paddingVertical="$6">
          {tab === 'discover' ? <Discover me={me} /> : <Host me={me} />}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
