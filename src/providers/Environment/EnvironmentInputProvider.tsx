import React, { createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import { EnvironmentConfigs, type Environment } from './environmentConfigs'

type EnvironmentInputShape = {
  environment?: Environment
  usePlaidSandbox?: boolean
}

const AuthInputContext = createContext<EnvironmentInputShape>({
  environment: undefined,
  usePlaidSandbox: undefined,
})

export function useEnvironment() {
  const { environment = 'production', usePlaidSandbox } = useContext(AuthInputContext)

  const {
    apiUrl,
    authUrl,
    scope,
    usePlaidSandbox: defaultUsePlaidSandbox
  } = EnvironmentConfigs[environment]

  return {
    environment,
    apiUrl,
    authUrl,
    scope,
    usePlaidSandbox: usePlaidSandbox ?? defaultUsePlaidSandbox
  }
}

export function EnvironmentInputProvider({
  children,
  environment,
  usePlaidSandbox,
}: PropsWithChildren<EnvironmentInputShape>) {
  const memoizedValue = useMemo(() => ({ environment, usePlaidSandbox }), [environment, usePlaidSandbox])

  return (
    <AuthInputContext.Provider value={memoizedValue}>
      {children}
    </AuthInputContext.Provider>
  )
}