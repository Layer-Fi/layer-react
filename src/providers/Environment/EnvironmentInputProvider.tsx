import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

import { type Environment, type EnvironmentConfigOverride, EnvironmentConfigs } from '@providers/Environment/environmentConfigs'

type EnvironmentInputShape = {
  environment?: Environment
  usePlaidSandbox?: boolean
  plaidRedirectUri?: string
  plaidReceivedRedirectUri?: string
  environmentOverride?: Environment
  apiUrlOverride?: string
  authUrlOverride?: string
  scopeOverride?: string
}

type EnvironmentInputProviderProps = {
  environment?: Environment
  usePlaidSandbox?: boolean
  plaidRedirectUri?: string
  plaidReceivedRedirectUri?: string
  environmentConfigOverride?: EnvironmentConfigOverride
}

const AuthInputContext = createContext<EnvironmentInputShape>({
  environment: undefined,
  usePlaidSandbox: undefined,
  plaidRedirectUri: undefined,
  plaidReceivedRedirectUri: undefined,
  environmentOverride: undefined,
  apiUrlOverride: undefined,
  authUrlOverride: undefined,
  scopeOverride: undefined,
})

export function useEnvironment() {
  const {
    environment = 'production',
    usePlaidSandbox,
    plaidRedirectUri,
    plaidReceivedRedirectUri,
    environmentOverride,
    apiUrlOverride,
    authUrlOverride,
    scopeOverride,
  } = useContext(AuthInputContext)
  const resolvedEnvironment = environmentOverride ?? environment

  const {
    apiUrl: defaultApiUrl,
    authUrl: defaultAuthUrl,
    scope: defaultScope,
    usePlaidSandbox: defaultUsePlaidSandbox,
  } = EnvironmentConfigs[resolvedEnvironment]

  return {
    environment: resolvedEnvironment,
    apiUrl: apiUrlOverride ?? defaultApiUrl,
    authUrl: authUrlOverride ?? defaultAuthUrl,
    scope: scopeOverride ?? defaultScope,
    usePlaidSandbox: usePlaidSandbox ?? defaultUsePlaidSandbox,
    plaidRedirectUri,
    plaidReceivedRedirectUri,
  }
}

export function EnvironmentInputProvider({
  children,
  environment,
  environmentConfigOverride,
  usePlaidSandbox,
  plaidRedirectUri,
  plaidReceivedRedirectUri,
}: PropsWithChildren<EnvironmentInputProviderProps>) {
  const environmentOverride = environmentConfigOverride?.environment
  const apiUrlOverride = environmentConfigOverride?.apiUrl
  const authUrlOverride = environmentConfigOverride?.authUrl
  const scopeOverride = environmentConfigOverride?.scope

  const memoizedValue = useMemo(
    () => ({
      environment,
      usePlaidSandbox,
      plaidRedirectUri,
      plaidReceivedRedirectUri,
      environmentOverride,
      apiUrlOverride,
      authUrlOverride,
      scopeOverride,
    }),
    [environment, usePlaidSandbox, plaidRedirectUri, plaidReceivedRedirectUri, environmentOverride, apiUrlOverride, authUrlOverride, scopeOverride],
  )

  return (
    <AuthInputContext.Provider value={memoizedValue}>
      {children}
    </AuthInputContext.Provider>
  )
}
