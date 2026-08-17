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
}

type TokenResponse = {
  environment?: Environment
  accessToken?: string
  expiresIn?: number
  message?: string
}

const Notice = ({ error = false, children }: PropsWithChildren<{ error?: boolean }>) => (
  <pre style={{ padding: 16, whiteSpace: 'pre-wrap', color: error ? '#b00020' : undefined }}>
    {children}
  </pre>
)

const fetchToken = async (): Promise<{ token: Token, refreshMs: number }> => {
  const response = await fetch(getTokenEndpoint(), { method: 'POST' })
  const body = await response.json() as TokenResponse

  if (!response.ok) throw new Error(body.message ?? `Token request failed: ${response.status}`)

  const { environment, accessToken, expiresIn } = body
  if (!environment || !accessToken || !expiresIn) {
    throw new Error('Token response was missing fields')
  }

  return { token: { environment, accessToken }, refreshMs: (expiresIn / 2) * 1000 }
}

// `useAuth` never renews a token it was handed. It keys on the token, so swapping re-auths in place.
const useToken = () => {
  const [token, setToken] = useState<Token | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const load = async () => {
      try {
        const { token: next, refreshMs } = await fetchToken()

        if (cancelled) return

        setToken(next)
        setError(null)
        timer = setTimeout(() => void load(), refreshMs)
      }
      catch (caught) {
        if (cancelled) return

        setError(caught instanceof Error ? caught.message : 'Token request failed')
      }
    }

    void load()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return { token, error }
}

const RealBackendSurface = ({ businessId, token, children }: PropsWithChildren<{
  businessId: string
  token: Token
}>) => {
  // Cast because `.storybook` lints under an inferred project that can't resolve this hook's aliases.
  const { data: business, isError } = useGetBusiness({ businessId }) as {
    data?: Business
    isError: boolean
  }
  const legalName = business?.legalName ?? null
  // `useAuth`'s own SWR call resolves a tick after mount even in explicit-token mode, so
  // `useGetBusiness` is briefly paused (key undefined): isLoading reports false with no data or
  // error. Waiting on `business` rather than just `!isLoading` closes that window.
  const isReady = !isError && business !== undefined

  useEffect(() => {
    if (legalName) remember(businessId, legalName)
  }, [businessId, legalName])

  return (
    <>
      {isError && <Notice error>{`Could not load business ${businessId}.`}</Notice>}
      {isReady && children}
      <RealBackendBadge businessId={businessId} name={legalName} environment={token.environment} />
    </>
  )
}

const RealBackendProvider = ({ businessId, children }: PropsWithChildren<{ businessId: string }>) => {
  const { token, error } = useToken()

  if (error) return <Notice error>{`Could not fetch a Storybook token: ${error}`}</Notice>

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
      <RealBackendSurface businessId={businessId} token={token}>{children}</RealBackendSurface>
    </LayerProvider>
  )
}

export const StorybookLayerProvider = ({ businessId, children }: PropsWithChildren<{ businessId?: string }>) => {
  if (!usesRealBackend) return <LayerTestProvider>{children}</LayerTestProvider>

  // Not falling back to the mock provider: fixtures under a real-backend build would read as real.
  if (!businessId) return <Notice>Enter a business ID in the toolbar to load real data.</Notice>

  return <RealBackendProvider businessId={businessId}>{children}</RealBackendProvider>
}
