import { useState } from 'react'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Button } from '../Button/Button'
import { Separator } from '../Separator/Separator'
import { CheckboxWithTooltip } from '../ui/Checkbox/Checkbox'
import { HStack, VStack } from '../ui/Stack/Stack'
import { useWizard } from '../Wizard/Wizard'
import { Label } from '../ui/Typography/Text'
import { AffectedTransactionsTable } from './AffectedTransactionsTable'
import { MinimalBankTransaction } from '../../schemas/bankTransactions/base'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'

interface RuleUpdatesPromptReviewStepProps {
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export function RuleUpdatesReviewStep({ ruleSuggestion }: RuleUpdatesPromptReviewStepProps) {
  const { next, previous } = useWizard()
  const { createCategorizationRule } = useBankTransactionsContext()
  const [applyRule, setApplyRule] = useState(true)
  return (
    <VStack gap='lg'>
      <br />
      <Label size='md'>
        {`The following ${ruleSuggestion.transactionsThatWillBeAffected.length} transactions will be affected:`}
      </Label>
      <AffectedTransactionsTable
        transactions={ruleSuggestion.transactionsThatWillBeAffected as MinimalBankTransaction[]}
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
          <CheckboxWithTooltip isSelected={applyRule} onChange={(isSelected) => { setApplyRule(isSelected) }} />
        </HStack>
        <Button
          onClick={() => {
            const ruleCreationParams = {
              ...ruleSuggestion,
              newRule: {
                ...ruleSuggestion.newRule,
                applyRetroactively: applyRule,
              },
            }
            void createCategorizationRule(ruleCreationParams.newRule)
            void next()
          }}
        >
          Submit
        </Button>
      </HStack>
    </VStack>
  )
}
