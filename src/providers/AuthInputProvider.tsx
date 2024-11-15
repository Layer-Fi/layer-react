import React, { createContext, useContext, useMemo, type PropsWithChildren } from 'react'

type AuthInputShape = {
  appId?: string
  appSecret?: string
  businessAccessToken?: string
}

const AuthInputContext = createContext<AuthInputShape>({
  appId: undefined,
  appSecret: undefined,
  businessAccessToken: undefined,
})

export function useAuthInput() {
  return useContext(AuthInputContext)
}

export function AuthInputProvider({
  appId,
  appSecret,
  businessAccessToken,
  children,
}: PropsWithChildren<AuthInputShape>) {
  const memoizedValue = useMemo(() => ({ appId, appSecret, businessAccessToken }), [
    appId,
    appSecret,
    businessAccessToken,
  ])

  return (
    <AuthInputContext.Provider value={memoizedValue}>
      {children}
    </AuthInputContext.Provider>
  )
}