import { createContext, useContext } from 'react'

/** Opens the host's bank connection flow. Resolves true once the new connection is saved. */
export type ConnectAccount = () => Promise<boolean>

export const ConnectAccountContext = createContext<ConnectAccount | null>(null)

export const useConnectAccount = () => useContext(ConnectAccountContext)
