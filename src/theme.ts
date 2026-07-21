/**
 * Gather's warm palette — ONE place for every brand color. The starter fixes a
 * theme via <GuiProvider defaultTheme>; Gather commits to a light, community
 * look, so surfaces use these explicit values (cream paper, terracotta accent)
 * rather than the neutral `$background`/`$color` tokens. All are plain strings,
 * safe to hand to any @hanzo/gui longhand style prop (backgroundColor/color/…).
 */
export const warm = {
  page: '#FFF8F1', // cream paper
  surface: '#FFFFFF',
  surfaceSoft: '#FFF1E4', // peach tint
  border: '#F1E3D2',
  borderSoft: '#F7ECDD',
  ink: '#2C2119', // warm near-black
  inkSoft: '#8A7565', // muted brown
  brand: '#E4572E', // terracotta
  brandDeep: '#C54524',
  amber: '#F4A340',
  gold: '#F6C453',
  going: '#2E9E5B',
  maybe: '#DB8B24',
  cant: '#D6555E',
} as const

/** Warm avatar backgrounds, cycled deterministically per attendee name. */
export const avatarInks = [
  '#E4572E',
  '#F4A340',
  '#2E9E5B',
  '#3E7CB1',
  '#B5658D',
  '#D6555E',
  '#7A9E3F',
  '#DB8B24',
  '#5B8C6E',
  '#C77DAF',
] as const

/** Stable index into a palette from a name, so an attendee keeps their color. */
export function hash(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h
}

export function inkFor(name: string): string {
  return avatarInks[hash(name) % avatarInks.length]
}

/** Up to two initials from a display name or email. */
export function initials(name: string): string {
  const base = name.includes('@') ? name.split('@')[0] : name
  const parts = base.split(/[\s._-]+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
