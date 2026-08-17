import { type PropsWithChildren, useEffect, useState } from 'react'

import { useGetBusiness } from '../src/hooks/api/businesses/[business-id]/get'
import { type Environment, EnvironmentConfigs } from '../src/providers/global/Environment/environmentConfigs'
import { LayerProvider } from '../src/providers/global/LayerProvider/LayerProvider'
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

/**
 * `BusinessSchema` drops `legal_name`, so `useGetBusiness` can't supply it — but the endpoint does
 * return it, and a raw read here beats widening a shipped schema to label a Storybook control. A
 * bare id is unrecognisable, so this is what makes the badge and the toolbar history legible.
 */
const useBusinessName = (businessId: string, token: Token | null) => {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setName(null)

    if (token === null) return

    const load = async () => {
      const response = await fetch(`${EnvironmentConfigs[token.environment].apiUrl}/v1/businesses/${businessId}`, {
        headers: { Authorization: `Bearer ${token.accessToken}` },
      })

      if (!response.ok) return

      const body = await response.json() as { data?: { legal_name?: string | null } }
      const legalName = body.data?.legal_name

      if (cancelled || !legalName) return

      setName(legalName)
      remember(businessId, legalName)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [businessId, token])

  return name
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

const RealBackendProvider = ({ businessId, children }: PropsWithChildren<{ businessId: string }>) => {
  const token = useToken()
  const name = useBusinessName(businessId, token)

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
      <RealBackendBadge
        businessId={businessId}
        name={name}
        environment={token.environment}
        refreshAt={token.refreshAt}
      />
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
