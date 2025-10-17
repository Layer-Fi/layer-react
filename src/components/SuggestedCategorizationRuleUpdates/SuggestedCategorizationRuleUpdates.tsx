import { Wizard } from '../Wizard/Wizard'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { unsafeAssertUnreachable } from '../../utils/switch/assertUnreachable'
import { RuleUpdatesPromptStep } from './RuleUpdatesPromptStep'
import { RuleUpdatesReviewStep } from './RuleUpdatesReviewStep'
import { ModalHeading } from '../ui/Modal/ModalSlots'

type SuggestedCategorizationRuleUpdatesProps = {
  close: () => void
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export function RuleSuggestionHeader({ ruleSuggestion }: { ruleSuggestion: UpdateCategorizationRulesSuggestion }) {
  switch (ruleSuggestion.type) {
    case 'Create_Categorization_Rule_For_Counterparty':
      return (
        <ModalHeading size='sm'>
          Always use this category?
        </ModalHeading>
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
  const hasTransactions = ruleSuggestion.transactionsThatWillBeAffected.length > 0

  return (
    <section className='Layer__component Layer__suggested-categorization-rule-updates'>
      <Wizard
        Header={undefined}
        Footer={undefined}
        onComplete={close}
        onStepChange={undefined}
      >
        <RuleUpdatesPromptStep ruleSuggestion={ruleSuggestion} close={close} />
        {hasTransactions && <RuleUpdatesReviewStep ruleSuggestion={ruleSuggestion} />}
      </Wizard>
    </section>
  )
}
