import { type PropsWithChildren, useEffect, useState } from 'react'

import { useGetBusiness } from '../src/hooks/api/businesses/[business-id]/get'
import { type Environment } from '../src/providers/global/Environment/environmentConfigs'
import { LayerProvider } from '../src/providers/global/LayerProvider/LayerProvider'
import { type Business } from '../src/schemas/features/business/business'
import { LayerTestProvider, TEST_LAYER_THEME } from '../src/testUtils/render/LayerTestProvider'
import { remember } from './businessHistory'
import { getTokenEndpoint, usesRealBackend } from './realBackend'
import { RealBackendBadge } from './RealBackendBadge'

type Token = {
  environment: Environment
  accessToken: string
  refreshAt: number
}

type TokenResponse = {
  environment?: Environment
  accessToken?: string
  expiresIn?: number
  message?: string
}

// `useAuth`'s explicit mode never renews a token it was handed, so refreshing has to happen here.
// The token is part of its SWR key, so swapping the prop re-keys auth without a remount.
const useToken = () => {
  const [token, setToken] = useState<Token | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const load = async () => {
      const response = await fetch(getTokenEndpoint(), { method: 'POST' })
      const body = await response.json() as TokenResponse

      if (!response.ok) throw new Error(body.message ?? `Token request failed: ${response.status}`)

      const { environment, accessToken, expiresIn } = body
      if (!environment || !accessToken || !expiresIn) {
        throw new Error('Token response was missing fields')
      }

      if (cancelled) return

      const refreshMs = (expiresIn / 2) * 1000

      setToken({ environment, accessToken, refreshAt: Date.now() + refreshMs })
      timer = setTimeout(() => void load(), refreshMs)
    }

    void load()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return token
}

// Reuses the fetch `LayerProvider` already made, so this costs no extra request.
const DemoBusinessGuard = ({ businessId, children }: PropsWithChildren<{ businessId: string }>) => {
  const { data: business, isLoading, isError } = useGetBusiness({ businessId })

  if (isLoading || (business === undefined && !isError)) return null

  if (isError || !business?.isDemo) {
    return (
      <pre style={{ padding: 16, color: '#b00020', whiteSpace: 'pre-wrap' }}>
        {isError
          ? `Could not load business ${businessId}.`
          : `Business ${businessId} is not a demo business. Real-backend Storybook refuses to render it.`}
      </pre>
    )
  }

  return <>{children}</>
}

// Inside `LayerProvider` so it can read the business, and on the same SWR key as the guard, so the
// two share one request. `legalName` is what makes the badge and toolbar history legible.
const BusinessBadge = ({ businessId, token }: { businessId: string, token: Token }) => {
  // Annotated because `.storybook` is linted under an inferred project that can't resolve the
  // aliased imports behind this hook, so its return type arrives untyped.
  const { data: business } = useGetBusiness({ businessId }) as { data?: Business }
  const legalName = business?.legalName ?? null

  useEffect(() => {
    if (legalName) remember(businessId, legalName)
  }, [businessId, legalName])

  return (
    <RealBackendBadge
      businessId={businessId}
      name={legalName}
      environment={token.environment}
      refreshAt={token.refreshAt}
    />
  )
}

const RealBackendProvider = ({ businessId, children }: PropsWithChildren<{ businessId: string }>) => {
  const token = useToken()

  if (token === null) return null

  return (
    <LayerProvider
      // SWR re-keys on `businessId`, but `BusinessProvider` reducer state would survive a switch.
      key={businessId}
      businessId={businessId}
      environment={token.environment}
      businessAccessToken={token.accessToken}
      theme={TEST_LAYER_THEME}
    >
      <DemoBusinessGuard businessId={businessId}>{children}</DemoBusinessGuard>
      <BusinessBadge businessId={businessId} token={token} />
    </LayerProvider>
  )
}

type StorybookLayerProviderProps = PropsWithChildren<{ businessId?: string }>

export const StorybookLayerProvider = ({ businessId, children }: StorybookLayerProviderProps) => {
  if (!usesRealBackend) return <LayerTestProvider>{children}</LayerTestProvider>

  // Deliberately not falling back to the mock provider: fixtures rendering under a real-backend
  // build would look like real data.
  if (!businessId) {
    return (
      <pre style={{ padding: 16, whiteSpace: 'pre-wrap' }}>
        Enter a business ID in the toolbar to load real data.
      </pre>
    )
  }

  return <RealBackendProvider businessId={businessId}>{children}</RealBackendProvider>
}
