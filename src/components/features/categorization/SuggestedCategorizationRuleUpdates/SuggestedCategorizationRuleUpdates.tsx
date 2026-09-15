import { useTranslation } from 'react-i18next'

import { type UpdateCategorizationRulesSuggestion } from '@schemas/features/categorization/createCategorizationRule'
import { COMPONENT_ROOT_CLASS_NAME } from '@utils/shared/styles/componentClassNames'
import { unsafeAssertUnreachable } from '@utils/shared/switch/assertUnreachable'
import { ModalHeading } from '@ui/Modal/ModalSlots'
import { Wizard } from '@blocks/Wizard/Wizard'
import { RuleUpdatesPromptStep } from '@features/categorization/SuggestedCategorizationRuleUpdates/RuleUpdatesPromptStep'
import { RuleUpdatesReviewStep } from '@features/categorization/SuggestedCategorizationRuleUpdates/RuleUpdatesReviewStep'
type SuggestedCategorizationRuleUpdatesProps = {
  close: () => void
  ruleSuggestion: UpdateCategorizationRulesSuggestion
  mobile?: boolean
  isDrawer?: boolean
}

export function RuleSuggestionHeader({ ruleSuggestion }: { ruleSuggestion: UpdateCategorizationRulesSuggestion }) {
  const { t } = useTranslation()
  switch (ruleSuggestion.type) {
    case 'Create_Categorization_Rule_For_Counterparty':
      return (
        <ModalHeading size='sm'>
          {t('categorization:SuggestedCategorizationRuleUpdates.prompt.always_use_category', 'Always use this category?')}
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
    <section className={COMPONENT_ROOT_CLASS_NAME}>
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
