import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext/BankTransactionsContext'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Button } from '../ui/Button/Button'
import { useWizard } from '../Wizard/Wizard'

interface CreateRuleButtonProps {
  ruleSuggestion: UpdateCategorizationRulesSuggestion
  applyRetroactively: boolean
  buttonText: string
}

export const CreateRuleButton = ({ ruleSuggestion, applyRetroactively, buttonText }: CreateRuleButtonProps) => {
  const { next } = useWizard()
  const { createCategorizationRule } = useBankTransactionsContext()
  const handleOnClick = () => {
    const ruleCreationParams = {
      ...ruleSuggestion,
      newRule: {
        ...ruleSuggestion.newRule,
        applyRetroactively: applyRetroactively,
      },
    }
    void createCategorizationRule(ruleCreationParams.newRule)
    void next()
  }
  return (
    <Button
      onClick={handleOnClick}
    >
      {buttonText}
    </Button>
  )
}
