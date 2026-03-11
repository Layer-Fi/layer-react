import { useTranslation } from 'react-i18next'

import { type UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { asMutable } from '@utils/asMutable'
import { tPlural } from '@utils/i18nPlural'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Separator } from '@components/Separator/Separator'
import { AffectedTransactionsTable } from '@components/SuggestedCategorizationRuleUpdates/AffectedTransactionsTable'
import { CreateRuleButton } from '@components/SuggestedCategorizationRuleUpdates/CreateRuleButton'
import { useWizard } from '@components/Wizard/Wizard'

interface RuleUpdatesPromptReviewStepProps {
  ruleSuggestion: UpdateCategorizationRulesSuggestion
  isDrawer?: boolean
}

export function RuleUpdatesReviewStep({ ruleSuggestion, isDrawer }: RuleUpdatesPromptReviewStepProps) {
  const { t } = useTranslation()
  const { previous } = useWizard()
  const ActionButtonsStack = isDrawer ? VStack : HStack

  return (
    <VStack pbe={isDrawer ? 'xl' : undefined}>
      <Span size='md'>
        {tPlural(t, 'followingCountTransactionsWillBeAffected', {
          count: ruleSuggestion.transactionsThatWillBeAffected.length,
          one: 'The following {{count}} transaction will be affected:',
          other: 'The following {{count}} transactions will be affected:',
        })}
      </Span>
      <AffectedTransactionsTable transactions={asMutable(ruleSuggestion.transactionsThatWillBeAffected)} />
      <Separator />
      <ActionButtonsStack gap='xs' justify='end' pbs='md'>
        <Button
          onClick={previous}
          variant='outlined'
          fullWidth={isDrawer}
        >
          {t('back', 'Back')}
        </Button>
        <CreateRuleButton
          newRule={ruleSuggestion.newRule}
          slotProps={{ fullWidth: isDrawer, children: t('submit', 'Submit') }}
        />
      </ActionButtonsStack>
    </VStack>
  )
}
