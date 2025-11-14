import { Wizard } from '@components/Wizard/Wizard'
import { UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { RuleUpdatesPromptStep } from '@components/SuggestedCategorizationRuleUpdates/RuleUpdatesPromptStep'
import { RuleUpdatesReviewStep } from '@components/SuggestedCategorizationRuleUpdates/RuleUpdatesReviewStep'
import { ModalHeading } from '@ui/Modal/ModalSlots'
import './suggestedCategorizationRuleUpdates.scss'

type SuggestedCategorizationRuleUpdatesProps = {
  close: () => void
  ruleSuggestion: UpdateCategorizationRulesSuggestion
  mobile?: boolean
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

export function SuggestedCategorizationRuleUpdates({ close, ruleSuggestion, mobile }: SuggestedCategorizationRuleUpdatesProps) {
  const hasTransactions = ruleSuggestion.transactionsThatWillBeAffected.length > 0

  return (
    <section className='Layer__component Layer__suggested-categorization-rule-updates'>
      <Wizard
        Header={undefined}
        Footer={undefined}
        onComplete={close}
        onStepChange={undefined}
      >
        <RuleUpdatesPromptStep ruleSuggestion={ruleSuggestion} close={close} mobile={mobile} />
        {hasTransactions && <RuleUpdatesReviewStep ruleSuggestion={ruleSuggestion} />}
      </Wizard>
    </section>
  )
}
