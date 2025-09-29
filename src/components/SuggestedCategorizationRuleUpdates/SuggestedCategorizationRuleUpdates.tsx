import { Wizard } from '../Wizard/Wizard'
import type { Awaitable } from '../../types/utility/promises'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'

type SuggestedCategorizationRuleUpdatesProps = {
  onComplete?: () => Awaitable<void>
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export function SuggestedCategorizationRuleUpdates({ onComplete, ruleSuggestion }: SuggestedCategorizationRuleUpdatesProps) {
  return (
    <section className='Layer__component Layer__suggested-categorization-rule-updates'>
      <Wizard
        Header={ruleSuggestion.suggestionPrompt}
        Footer={null}
        onComplete={onComplete}
        onStepChange={undefined}
      >
      </Wizard>
    </section>
  )
}
