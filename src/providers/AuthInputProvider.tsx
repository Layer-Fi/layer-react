import React, { createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import type { Environment } from '../providers/LayerProvider/environment'

type AuthInputShape = {
  appId?: string
  appSecret?: string
  businessAccessToken?: string
  environment?: Environment
}

const AuthInputContext = createContext<AuthInputShape>({
  appId: undefined,
  appSecret: undefined,
  businessAccessToken: undefined,
  environment: undefined,
})

export function useAuthInput() {
  return useContext(AuthInputContext)
}

export function AuthInputProvider({
  appId,
  appSecret,
  businessAccessToken,
  children,
  environment,
}: PropsWithChildren<AuthInputShape>) {
  const memoizedValue = useMemo(() => ({ appId, appSecret, businessAccessToken, environment }), [
    appId,
    appSecret,
    businessAccessToken,
    environment,
  ])

  return (
    <AuthInputContext.Provider value={memoizedValue}>
      {children}
    </AuthInputContext.Provider>
  )
}