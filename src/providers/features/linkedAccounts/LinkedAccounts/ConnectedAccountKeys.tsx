import { createContext, type PropsWithChildren, useContext, useState } from 'react'

const ConnectedAccountKeysContext = createContext<Set<string> | null>(null)

export function ConnectedAccountKeysProvider({ children }: PropsWithChildren) {
  const [connectedKeys] = useState(() => new Set<string>())

  return (
    <ConnectedAccountKeysContext.Provider value={connectedKeys}>
      {children}
    </ConnectedAccountKeysContext.Provider>
  )
}

export function useConnectedAccountKeys() {
  return useContext(ConnectedAccountKeysContext)
}
