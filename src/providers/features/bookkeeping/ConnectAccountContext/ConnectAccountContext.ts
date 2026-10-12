import { createContext, useContext } from 'react'

export type ConnectAccount = () => Promise<boolean>

export const ConnectAccountContext = createContext<ConnectAccount | null>(null)

export const useConnectAccount = () => useContext(ConnectAccountContext)
