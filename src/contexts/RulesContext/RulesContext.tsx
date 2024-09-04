import { createContext } from 'react'
import { useRules } from '../../hooks/useRules'

export type RulesContextType = ReturnType<typeof useRules>
export const RulesContext = createContext<RulesContextType>({
  data: undefined,
  isLoading: false,
  error: undefined,
  refetch: () => {},
  selectedRuleId: undefined,
  setSelectedRuleId: () => {},
  addRule: () => {},
})