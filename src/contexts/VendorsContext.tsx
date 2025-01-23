import React, { createContext, ReactNode, useContext } from 'react'
import { useVendors } from '../hooks/useVendors'

type VendorsProviderProps = {
  children: ReactNode
}

export type VendorsContextType = ReturnType<typeof useVendors>
export const VendorsContext = createContext<VendorsContextType>({
  data: [],
})

export const useVendorsContext = () => useContext(VendorsContext)

export const VendorsProvider: React.FC<VendorsProviderProps> = ({ children }) => {
  const vendors = useVendors()

  return (
    <VendorsContext.Provider value={vendors}>
      {children}
    </VendorsContext.Provider>
  )
}
