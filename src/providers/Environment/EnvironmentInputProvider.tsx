import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

import { type Environment, type EnvironmentConfig, EnvironmentConfigs } from '@providers/Environment/environmentConfigs'

type EnvironmentInputShape = {
  environment?: Environment
  usePlaidSandbox?: boolean
  environmentConfigOverride?: EnvironmentConfig
}

const AuthInputContext = createContext<EnvironmentInputShape>({
  environment: undefined,
  usePlaidSandbox: undefined,
  environmentConfigOverride: undefined,
})

export function useEnvironment() {
  const { environment = 'production', usePlaidSandbox, environmentConfigOverride = undefined } = useContext(AuthInputContext)

  const {
    apiUrl,
    authUrl,
    scope,
    usePlaidSandbox: defaultUsePlaidSandbox,
  } = EnvironmentConfigs[environment]

  return {
    environment: environmentConfigOverride?.environment ?? environment,
    apiUrl: environmentConfigOverride?.apiUrl ?? apiUrl,
    authUrl: environmentConfigOverride?.authUrl ?? authUrl,
    scope: environmentConfigOverride?.scope ?? scope,
    usePlaidSandbox: usePlaidSandbox ?? defaultUsePlaidSandbox,
  }
}

export function EnvironmentInputProvider({
  children,
  environment,
  environmentConfigOverride,
  usePlaidSandbox,
}: PropsWithChildren<EnvironmentInputShape & { environmentConfigOverride?: EnvironmentConfig }>) {
  const memoizedValue = useMemo(
    () => ({ environment, environmentConfigOverride, usePlaidSandbox }),
    [environment, environmentConfigOverride, usePlaidSandbox],
  )

  return (
    <AuthInputContext.Provider value={memoizedValue}>
      {children}
    </AuthInputContext.Provider>
  )
}
