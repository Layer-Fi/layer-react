import { useState } from 'react'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Button } from '../../components/ui/Button/Button'
import { Separator } from '../Separator/Separator'
import { CheckboxWithTooltip } from '../ui/Checkbox/Checkbox'
import { HStack, VStack } from '../ui/Stack/Stack'
import { useWizard } from '../Wizard/Wizard'
import { Label } from '../ui/Typography/Text'
import { AffectedTransactionsTable } from './AffectedTransactionsTable'
import pluralize from 'pluralize'
import { CreateRuleButton } from './CreateRuleButton'

interface RuleUpdatesPromptReviewStepProps {
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export function RuleUpdatesReviewStep({ ruleSuggestion }: RuleUpdatesPromptReviewStepProps) {
  const { previous } = useWizard()
  const [applyRuleRetroactively, setApplyRuleRetroactively] = useState(true)

  return (
    <VStack gap='lg'>
      <Label size='md'>
        {`The following ${pluralize('transaction', Math.abs(ruleSuggestion.transactionsThatWillBeAffected.length), true)} will be affected:`}
      </Label>
      <AffectedTransactionsTable
        transactions={ruleSuggestion.transactionsThatWillBeAffected}
      />
      <Separator />
      <HStack justify='space-between'>
        <Button
          onClick={() => {
            previous()
          }}
        >
          Back
        </Button>
        <HStack gap='3xs'>
          <Label size='sm' htmlFor='apply_rule'>
            Apply rule after creating?
          </Label>
          <CheckboxWithTooltip id='apply_rule' isSelected={applyRuleRetroactively} onChange={(isSelected) => { setApplyRuleRetroactively(isSelected) }} />
        </HStack>
        <CreateRuleButton
          newRule={{
            ...ruleSuggestion.newRule,
            applyRetroactively: applyRuleRetroactively,
          }}
          buttonText='Submit'
        />
      </HStack>
    </VStack>
  )
}
