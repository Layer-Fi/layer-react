import { Button } from '@ui/Button/Button'
import { UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { Separator } from '@components/Separator/Separator'
import { HStack, VStack } from '@ui/Stack/Stack'
import { useWizard } from '@components/Wizard/Wizard'
import { Label } from '@ui/Typography/Text'
import { AffectedTransactionsTable } from '@components/SuggestedCategorizationRuleUpdates/AffectedTransactionsTable'
import pluralize from 'pluralize'
import { CreateRuleButton } from '@components/SuggestedCategorizationRuleUpdates/CreateRuleButton'
import { asMutable } from '@utils/asMutable'

interface RuleUpdatesPromptReviewStepProps {
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export function RuleUpdatesReviewStep({ ruleSuggestion }: RuleUpdatesPromptReviewStepProps) {
  const { previous } = useWizard()

  return (
    <VStack gap='lg'>
      <Label size='md'>
        {`The following ${pluralize('transaction', ruleSuggestion.transactionsThatWillBeAffected.length, ruleSuggestion.transactionsThatWillBeAffected.length !== 1)} will be affected:`}
      </Label>
      <AffectedTransactionsTable
        transactions={asMutable(ruleSuggestion.transactionsThatWillBeAffected)}
      />
      <Separator />
      <HStack gap='sm'>
        <Button
          onClick={() => {
            previous()
          }}
          variant='outlined'
        >
          Back
        </Button>
        <CreateRuleButton
          newRule={ruleSuggestion.newRule}
          buttonText='Submit'
        />
      </HStack>
    </VStack>
  )
}
