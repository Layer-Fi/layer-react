import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

type AuthInputShape = {
  businessAccessToken?: string
}

const AuthInputContext = createContext<AuthInputShape>({
  businessAccessToken: undefined,
})

export function useAuthInput() {
  return useContext(AuthInputContext)
}

export function AuthInputProvider({
  businessAccessToken,
  children,
}: PropsWithChildren<AuthInputShape>) {
  const memoizedValue = useMemo(() => ({ businessAccessToken }), [businessAccessToken])

  return (
    <AuthInputContext.Provider value={memoizedValue}>
      {children}
    </AuthInputContext.Provider>
  )
}
