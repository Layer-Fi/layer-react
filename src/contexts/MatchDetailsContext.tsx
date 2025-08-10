import { createContext, useContext, ReactNode } from 'react'
import { MatchDetails } from '../types/match_details'
import { SourceLink } from '../types/utility/links'

interface MatchDetailsContextType {
  convertToSourceLink?: (details: MatchDetails) => SourceLink
}

const MatchDetailsContext = createContext<MatchDetailsContextType>({})

export const useMatchDetailsContext = () => {
  return useContext(MatchDetailsContext)
}

interface MatchDetailsProviderProps {
  convertToSourceLink?: (details: MatchDetails) => SourceLink
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