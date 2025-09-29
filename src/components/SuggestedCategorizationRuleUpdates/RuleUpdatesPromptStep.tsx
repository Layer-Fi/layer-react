import { useState } from 'react'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Button } from '../Button/Button'
import { useWizard } from '../Wizard/Wizard'
import { CheckboxWithTooltip } from '../ui/Checkbox/Checkbox'

interface RuleUpdatesPromptStepProps {
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export function RuleUpdatesPromptStep({ ruleSuggestion }: RuleUpdatesPromptStepProps) {
  const { next, previous } = useWizard()
  const [dontAskAgain, setDontAskAgain] = useState(false)
  return (
    <>
      {ruleSuggestion.suggestionPrompt}
      <CheckboxWithTooltip isSelected={dontAskAgain} onChange={(isSelected) => { setDontAskAgain(isSelected) }} />
      <Button
        onClick={() => {
          previous()
        }}
      >
        No
      </Button>
      <Button
        onClick={() => {
          void next()
        }}
      >
        Yes
      </Button>
    </>
  )
}
