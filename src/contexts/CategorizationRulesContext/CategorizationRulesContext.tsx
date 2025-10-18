import { createContext, useMemo, useState, useEffect, type PropsWithChildren } from 'react'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { setupRuleSuggestionDevHelper } from './testUtils'

export interface CategorizationRulesContextType {
  ruleSuggestion: UpdateCategorizationRulesSuggestion | null
  setRuleSuggestion: React.Dispatch<React.SetStateAction<UpdateCategorizationRulesSuggestion | null>>
}

const defaultContextValue: CategorizationRulesContextType = {
  ruleSuggestion: null,
  setRuleSuggestion: () => {},
}

export const CategorizationRulesContext = createContext<CategorizationRulesContextType>(defaultContextValue)
export function CategorizationRulesProvider({ children }: PropsWithChildren) {
  const [ruleSuggestion, setRuleSuggestion] = useState<UpdateCategorizationRulesSuggestion | null>(null)

  const value = useMemo(() => ({ ruleSuggestion, setRuleSuggestion }), [ruleSuggestion])

  // Development helper: expose window.testRuleSuggestionModal()
  useEffect(() => setupRuleSuggestionDevHelper(setRuleSuggestion), [])

  return (
    <CategorizationRulesContext.Provider value={value}>
      {children}
    </CategorizationRulesContext.Provider>
  )
}
