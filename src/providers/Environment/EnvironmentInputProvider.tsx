import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

import { type Environment, EnvironmentConfigs } from '@providers/Environment/environmentConfigs'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type EnvironmentInputShape = {
  environment?: Environment
  usePlaidSandbox?: boolean
}

const AuthInputContext = createContext<EnvironmentInputShape>({
  environment: undefined,
  usePlaidSandbox: undefined,
})

export function useEnvironment() {
  const { environment: environmentOverride } = useLayerContext()
  const { environment = 'production', usePlaidSandbox } = useContext(AuthInputContext)

  const {
    apiUrl,
    authUrl,
    scope,
    usePlaidSandbox: defaultUsePlaidSandbox,
  } = EnvironmentConfigs[environment]

  return {
    environment: environmentOverride?.environment ?? environment,
    apiUrl: environmentOverride?.apiUrl ?? apiUrl,
    authUrl: environmentOverride?.authUrl ?? authUrl,
    scope: environmentOverride?.scope ?? scope,
    usePlaidSandbox: usePlaidSandbox ?? defaultUsePlaidSandbox,
  }
}

export function EnvironmentInputProvider({
  children,
  environment,
  usePlaidSandbox,
}: PropsWithChildren<EnvironmentInputShape>) {
  const memoizedValue = useMemo(
    () => ({ environment, usePlaidSandbox }),
    [environment, usePlaidSandbox],
  )

  return (
    <AuthInputContext.Provider value={memoizedValue}>
      {children}
    </AuthInputContext.Provider>
  )
}
