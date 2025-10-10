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
import { asMutable } from '../../utils/asMutable'

interface RuleUpdatesPromptReviewStepProps {
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export function RuleUpdatesReviewStep({ ruleSuggestion }: RuleUpdatesPromptReviewStepProps) {
  const { previous } = useWizard()
  const [applyRuleRetroactively, setApplyRuleRetroactively] = useState(true)

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
          newRule={{
            ...ruleSuggestion.newRule,
            applyRetroactively: applyRuleRetroactively,
          }}
          buttonText='Submit'
        />
      </HStack>
      <HStack gap='3xs' justify='center'>
        <CheckboxWithTooltip id='apply_rule' isSelected={applyRuleRetroactively} onChange={(isSelected) => { setApplyRuleRetroactively(isSelected) }} />
        <Label size='sm' htmlFor='apply_rule'>
          Apply rule after creating?
        </Label>
      </HStack>
    </VStack>
  )
}
