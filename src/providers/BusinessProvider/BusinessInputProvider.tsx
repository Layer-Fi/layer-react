import React, { createContext, useContext, useMemo, type PropsWithChildren } from 'react'

type BusinessInputShape = {
  businessId: string
}

const AuthInputContext = createContext<BusinessInputShape>({
  businessId: '',
})

export function useBusinessId() {
  return useContext(AuthInputContext)
}

export function BusinessInputProvider({
  businessId,
  children,
}: PropsWithChildren<BusinessInputShape>) {
  const memoizedValue = useMemo(() => ({ businessId }), [ businessId ])

  return (
    <AuthInputContext.Provider value={memoizedValue}>
      {children}
    </AuthInputContext.Provider>
  )
}