import { type UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { ModalHeading } from '@ui/Modal/ModalSlots'
import { RuleUpdatesPromptStep } from '@components/SuggestedCategorizationRuleUpdates/RuleUpdatesPromptStep'
import { RuleUpdatesReviewStep } from '@components/SuggestedCategorizationRuleUpdates/RuleUpdatesReviewStep'
import { Wizard } from '@components/Wizard/Wizard'

type SuggestedCategorizationRuleUpdatesProps = {
  close: () => void
  ruleSuggestion: UpdateCategorizationRulesSuggestion
  mobile?: boolean
  isDrawer?: boolean
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

export function SuggestedCategorizationRuleUpdates({ close, ruleSuggestion, isDrawer }: SuggestedCategorizationRuleUpdatesProps) {
  const hasTransactions = ruleSuggestion.transactionsThatWillBeAffected.length > 0

  return (
    <section className='Layer__component'>
      <Wizard
        Header={undefined}
        Footer={undefined}
        onComplete={close}
        onStepChange={undefined}
      >
        <RuleUpdatesPromptStep ruleSuggestion={ruleSuggestion} close={close} isDrawer={isDrawer} />
        {hasTransactions && <RuleUpdatesReviewStep ruleSuggestion={ruleSuggestion} isDrawer={isDrawer} />}
      </Wizard>
    </section>
  )
}
