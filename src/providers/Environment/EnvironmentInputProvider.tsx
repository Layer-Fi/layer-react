import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

import { type Environment, type EnvironmentConfig, EnvironmentConfigs } from '@providers/Environment/environmentConfigs'

type EnvironmentConfigOverride = Omit<EnvironmentConfig, 'usePlaidSandbox'>

type EnvironmentInputShape = {
  environment?: Environment
  usePlaidSandbox?: boolean
  environmentConfigOverride?: EnvironmentConfigOverride
}

const AuthInputContext = createContext<EnvironmentInputShape>({
  environment: undefined,
  usePlaidSandbox: undefined,
  environmentConfigOverride: undefined,
})

export function useEnvironment() {
  const { environment = 'production', usePlaidSandbox, environmentConfigOverride = undefined } = useContext(AuthInputContext)
  const resolvedEnvironment = environmentConfigOverride?.environment ?? environment

  const {
    apiUrl: defaultApiUrl,
    authUrl: defaultAuthUrl,
    scope: defaultScope,
    usePlaidSandbox: defaultUsePlaidSandbox,
  } = EnvironmentConfigs[resolvedEnvironment]

  return {
    environment: resolvedEnvironment,
    apiUrl: environmentConfigOverride?.apiUrl ?? defaultApiUrl,
    authUrl: environmentConfigOverride?.authUrl ?? defaultAuthUrl,
    scope: environmentConfigOverride?.scope ?? defaultScope,
    usePlaidSandbox: usePlaidSandbox ?? defaultUsePlaidSandbox,
  }
}

export function EnvironmentInputProvider({
  children,
  environment,
  environmentConfigOverride,
  usePlaidSandbox,
}: PropsWithChildren<EnvironmentInputShape>) {
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
