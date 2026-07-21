import type { ReactNode } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, Spinner } from '@hanzo/gui'
import { warm } from './theme'
import { Callback } from './auth/callback'
import { Landing } from './views/landing'
import { Home } from './views/home'

function Center({ children }: { children: ReactNode }) {
  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" backgroundColor={warm.page}>
      {children}
    </YStack>
  )
}

/**
 * Top-level route + auth gate — no router dependency (one static SPA):
 *   /auth/callback  → finish the PKCE exchange, then land home
 *   signed out      → the public event landing
 *   signed in       → the app (Discover RSVPs + Host dashboard, Base-backed)
 */
export function App() {
  const { isAuthenticated, isLoading } = useIam()

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback')) {
    return <Callback />
  }
  if (isLoading) {
    return (
      <Center>
        <Spinner size="large" color={warm.brand} />
      </Center>
    )
  }
  return isAuthenticated ? <Home /> : <Landing />
}
