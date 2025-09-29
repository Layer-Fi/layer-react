import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Button } from '../Button/Button'
import { useWizard } from '../Wizard/Wizard'

interface RuleUpdatesPromptReviewStepProps {
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export function RuleUpdatesReviewStep({ ruleSuggestion }: RuleUpdatesPromptReviewStepProps) {
  const { next, previous } = useWizard()
  return (
    <>
      {`${ruleSuggestion.transactionsThatWillBeAffected.length} transactions will be affected`}
      <Button
        onClick={() => {
          previous()
        }}
      >
        Back
      </Button>
      <Button
        onClick={() => {
          void next()
        }}
      >
        Continue
      </Button>
    </>
  )
}
