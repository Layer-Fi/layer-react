import { createContext, useContext, ReactNode } from 'react'
import { SourceLink } from '../types/utility/links'
import { MatchDetailsType } from '../schemas/matchSchemas'

interface MatchDetailsContextType {
  convertToSourceLink?: (details: MatchDetailsType) => SourceLink
}

const MatchDetailsContext = createContext<MatchDetailsContextType>({})

export const useMatchDetailsContext = () => {
  return useContext(MatchDetailsContext)
}

interface MatchDetailsProviderProps {
  convertToSourceLink?: (details: MatchDetailsType) => SourceLink
  children: ReactNode
}

export const MatchDetailsProvider = ({
  convertToSourceLink,
  children,
}: MatchDetailsProviderProps) => {
  return (
    <MatchDetailsContext.Provider value={{ convertToSourceLink }}>
      {children}
    </MatchDetailsContext.Provider>
  )
}
