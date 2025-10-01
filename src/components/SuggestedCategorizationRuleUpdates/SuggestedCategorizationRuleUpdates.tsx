import { Wizard } from '../Wizard/Wizard'
import type { Awaitable } from '../../types/utility/promises'
import { Heading } from '../ui/Typography/Heading'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { unsafeAssertUnreachable } from '../../utils/switch/assertUnreachable'
import { RuleUpdatesPromptStep } from './RuleUpdatesPromptStep'
import { RuleUpdatesReviewStep } from './RuleUpdatesReviewStep'
import { useRejectCategorizationRulesUpdateSuggestion } from '../../hooks/useBankTransactions/useRejectCategorizationRulesUpdateSuggestion'

type SuggestedCategorizationRuleUpdatesProps = {
  close: () => Awaitable<void>
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

const getHeaderForRule = (ruleSuggestion: UpdateCategorizationRulesSuggestion) => {
  switch (ruleSuggestion.type) {
    case 'Create_Categorization_Rule_For_Counterparty':
      return (
        <Heading level={1} size='xl' pie='2xl'>
          Always use this category?
        </Heading>
      )
    default: {
      unsafeAssertUnreachable({
        value: ruleSuggestion.type,
        message: 'Unexpected rules update suggestion type',
      })
    }
  }
}

export function SuggestedCategorizationRuleUpdates({ close, ruleSuggestion }: SuggestedCategorizationRuleUpdatesProps) {
  const rejectRuleSuggestion = useRejectCategorizationRulesUpdateSuggestion()
  function onClose(dontAskAgain: boolean) {
    if (dontAskAgain) {
      const suggestionId = ruleSuggestion.newRule.createdBySuggestionId
      if (suggestionId) {
        rejectRuleSuggestion?.(suggestionId)
      }
    }
    void close()
  }

  return (
    <section className='Layer__component Layer__suggested-categorization-rule-updates'>
      <Wizard
        Header={getHeaderForRule(ruleSuggestion)}
        Footer={undefined}
        onComplete={close}
        onStepChange={undefined}
      >
        <RuleUpdatesPromptStep ruleSuggestion={ruleSuggestion} onClose={onClose} />
        <RuleUpdatesReviewStep ruleSuggestion={ruleSuggestion} />
      </Wizard>
    </section>
  )
}
