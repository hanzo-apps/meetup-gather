import { useEffect, useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, Spinner, Paragraph } from '@hanzo/gui'
import { warm } from '../theme'
import { TextButton } from '../views/parts'

/**
 * The PKCE return leg. hanzo.id redirects here with `?code=&state=`; the SDK
 * exchanges the code for tokens, then we land on the app root. On failure we
 * show the error and a way back rather than a blank spinner.
 */
export function Callback() {
  const { handleCallback } = useIam()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
      .then(() => window.location.replace('/'))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Sign-in failed'))
  }, [handleCallback])

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" gap="$4" backgroundColor={warm.page}>
      {error ? (
        <>
          <Paragraph color={warm.cant}>{error}</Paragraph>
          <TextButton
            label="Back to Gather"
            bg={warm.brand}
            fg="#FFFFFF"
            radius={12}
            onPress={() => window.location.replace('/')}
          />
        </>
      ) : (
        <>
          <Spinner size="large" color={warm.brand} />
          <Paragraph color={warm.inkSoft}>Completing sign-in…</Paragraph>
        </>
      )}
    </YStack>
  )
}
