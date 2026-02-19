import pluralize from 'pluralize'

import { type UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { asMutable } from '@utils/asMutable'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Separator } from '@components/Separator/Separator'
import { AffectedTransactionsTable } from '@components/SuggestedCategorizationRuleUpdates/AffectedTransactionsTable'
import { CreateRuleButton } from '@components/SuggestedCategorizationRuleUpdates/CreateRuleButton'
import { useWizard } from '@components/Wizard/Wizard'

import './ruleUpdatesReviewStep.scss'

interface RuleUpdatesPromptReviewStepProps {
  ruleSuggestion: UpdateCategorizationRulesSuggestion
  isDrawer?: boolean
}

export function RuleUpdatesReviewStep({ ruleSuggestion, isDrawer }: RuleUpdatesPromptReviewStepProps) {
  const { previous } = useWizard()
  const ActionButtonsStack = isDrawer ? VStack : HStack

  return (
    <VStack pbe={isDrawer ? 'xl' : undefined}>
      <Span size='md'>
        {`The following ${pluralize('transaction', ruleSuggestion.transactionsThatWillBeAffected.length, ruleSuggestion.transactionsThatWillBeAffected.length !== 1)} will be affected:`}
      </Span>
      <AffectedTransactionsTable transactions={asMutable(ruleSuggestion.transactionsThatWillBeAffected)} />
      <Separator />
      <ActionButtonsStack gap='xs' justify='end' className={isDrawer ? 'Layer__RuleUpdatesReviewStep__buttons--mobile' : undefined}>
        <Button
          onClick={previous}
          variant='outlined'
          fullWidth={isDrawer}
        >
          Back
        </Button>
        <CreateRuleButton
          newRule={ruleSuggestion.newRule}
          slotProps={{ fullWidth: isDrawer, children: 'Submit' }}
        />
      </ActionButtonsStack>
    </VStack>
  )
}
