import type { ReactNode } from 'react'
import { YStack, XStack, Text, SizableText, Button } from '@hanzo/gui'
import type { SizeTokens } from '@hanzo/gui'
import { warm, inkFor, initials } from '../theme'

/**
 * Shared presentational primitives — built from @hanzo/gui stacks + text, in the
 * warm Gather look. No second UI kit: a "card" is a rounded YStack, an "avatar"
 * is a circular YStack with initials. One place, reused across all three views.
 */

/** The Gather wordmark: a terracotta rounded tile + the name. */
export function Brand({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const tile = size === 'lg' ? 44 : size === 'sm' ? 26 : 34
  const name = size === 'lg' ? 28 : size === 'sm' ? 17 : 21
  return (
    <XStack alignItems="center" gap="$2.5">
      <YStack
        width={tile}
        height={tile}
        borderRadius={tile * 0.32}
        backgroundColor={warm.brand}
        alignItems="center"
        justifyContent="center"
        shadowColor={warm.brand}
        shadowOpacity={0.35}
        shadowRadius={10}
        shadowOffset={{ width: 0, height: 4 }}
      >
        <Text color="#FFFFFF" fontSize={tile * 0.5} fontWeight="900" marginTop={-2}>
          ⏣
        </Text>
      </YStack>
      <Text color={warm.ink} fontSize={name} fontWeight="800" letterSpacing={-0.5}>
        Gather
      </Text>
    </XStack>
  )
}

/** A rounded, warm paper card. Pass `tone="soft"` for the peach fill. */
export function Card({
  children,
  tone = 'plain',
  padding = 20,
}: {
  children: ReactNode
  tone?: 'plain' | 'soft'
  padding?: number
}) {
  return (
    <YStack
      backgroundColor={tone === 'soft' ? warm.surfaceSoft : warm.surface}
      borderColor={tone === 'soft' ? warm.borderSoft : warm.border}
      borderWidth={1}
      borderRadius={22}
      padding={padding}
      gap="$3"
      shadowColor="#B98A5E"
      shadowOpacity={0.1}
      shadowRadius={18}
      shadowOffset={{ width: 0, height: 8 }}
    >
      {children}
    </YStack>
  )
}

/** A small rounded label. */
export function Pill({
  children,
  color = warm.brand,
  fill,
}: {
  children: ReactNode
  color?: string
  fill?: string
}) {
  return (
    <XStack
      alignSelf="flex-start"
      backgroundColor={fill ?? withAlpha(color, 0.12)}
      paddingHorizontal={11}
      paddingVertical={5}
      borderRadius={999}
      alignItems="center"
      gap="$1.5"
    >
      <Text color={color} fontSize={12} fontWeight="700" letterSpacing={0.2}>
        {children}
      </Text>
    </XStack>
  )
}

/** A single circular attendee token with initials. */
export function Avatar({ name, size = 40, ring = warm.surface }: { name: string; size?: number; ring?: string }) {
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={999}
      backgroundColor={inkFor(name)}
      alignItems="center"
      justifyContent="center"
      borderWidth={2}
      borderColor={ring}
    >
      <Text color="#FFFFFF" fontSize={Math.round(size * 0.38)} fontWeight="800">
        {initials(name)}
      </Text>
    </YStack>
  )
}

/** An overlapping row of avatars + a "+N" overflow token — compact, for cards. */
export function AvatarStack({ names, max = 6, size = 34 }: { names: string[]; max?: number; size?: number }) {
  const shown = names.slice(0, max)
  const extra = names.length - shown.length
  return (
    <XStack alignItems="center" paddingLeft={size * 0.28}>
      {shown.map((n, i) => (
        <YStack key={n + i} marginLeft={-size * 0.28} zIndex={i}>
          <Avatar name={n} size={size} />
        </YStack>
      ))}
      {extra > 0 ? (
        <YStack
          marginLeft={-size * 0.28}
          width={size}
          height={size}
          borderRadius={999}
          backgroundColor={warm.ink}
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderColor={warm.surface}
        >
          <Text color="#FFFFFF" fontSize={Math.round(size * 0.32)} fontWeight="800">
            +{extra}
          </Text>
        </YStack>
      ) : null}
    </XStack>
  )
}

/** A wrapped grid of named avatars — for the hero "who's coming" wall. */
export function AvatarGrid({ names, size = 46, ring = warm.page }: { names: string[]; size?: number; ring?: string }) {
  return (
    <XStack flexWrap="wrap" gap="$2">
      {names.map((n, i) => (
        <Avatar key={n + i} name={n} size={size} ring={ring} />
      ))}
    </XStack>
  )
}

/** A labeled statistic chip (e.g. "12 going"). */
export function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <XStack alignItems="baseline" gap="$1.5">
      <Text color={color} fontSize={19} fontWeight="800">
        {n}
      </Text>
      <SizableText color={warm.inkSoft} fontSize={13}>
        {label}
      </SizableText>
    </XStack>
  )
}

/**
 * The one button in Gather. The @hanzo/gui `Button` is a styled stack that takes
 * stack props (backgroundColor/borderRadius/padding/hover) but NOT text props —
 * so the label is a nested <Text> that owns its color/weight. Every call site
 * styles through here; `elevated` adds the warm CTA glow.
 */
export function TextButton({
  label,
  onPress,
  disabled,
  size = '$3',
  bg = 'transparent',
  fg = warm.ink,
  hoverBg,
  radius = 999,
  px = 18,
  weight = '700',
  fontSize = 14,
  elevated,
  alignSelf,
  flex,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  size?: SizeTokens
  bg?: string
  fg?: string
  hoverBg?: string
  radius?: number
  px?: number
  weight?: '600' | '700' | '800' | '900'
  fontSize?: number
  elevated?: boolean
  alignSelf?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  flex?: number
}) {
  const hover = hoverBg ?? bg
  return (
    <Button
      size={size}
      backgroundColor={bg}
      borderRadius={radius}
      paddingHorizontal={px}
      alignSelf={alignSelf}
      flex={flex}
      disabled={disabled}
      onPress={onPress}
      hoverStyle={{ backgroundColor: hover }}
      pressStyle={{ backgroundColor: hover }}
      shadowColor={elevated ? bg : undefined}
      shadowOpacity={elevated ? 0.4 : undefined}
      shadowRadius={elevated ? 16 : undefined}
      shadowOffset={elevated ? { width: 0, height: 8 } : undefined}
    >
      <Text color={fg} fontSize={fontSize} fontWeight={weight}>
        {label}
      </Text>
    </Button>
  )
}

/** Blend a hex color toward transparency for soft fills (web rgba). */
export function withAlpha(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
