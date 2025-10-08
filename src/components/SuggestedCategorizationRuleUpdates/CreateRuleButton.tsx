import { Schema } from 'effect/index'
import { Button } from '../../components/ui/Button/Button'
import { useLayerContext } from '../../contexts/LayerContext'
import { useCreateCategorizationRule } from '../../hooks/useCategorizationRules/useCreateCategorizationRule'
import { CreateCategorizationRule, CreateCategorizationRuleSchema } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { useWizard } from '../Wizard/Wizard'

interface CreateRuleButtonProps {
  newRule: CreateCategorizationRule
  buttonText: string
}

export const CreateRuleButton = ({ newRule: ruleSuggestion, buttonText }: CreateRuleButtonProps) => {
  const { next } = useWizard()
  const { trigger: createCategorizationRule, isMutating } = useCreateCategorizationRule()
  const { addToast } = useLayerContext()
  return (
    <Button
      onPress={() => {
        void (async () => {
          const encodedRule = Schema.encodeUnknownSync(CreateCategorizationRuleSchema)(ruleSuggestion)
          await createCategorizationRule(encodedRule).then(() => {
            void next()
          }).catch(() => {
            addToast({ content: 'Failed to create categorization rule', type: 'error' })
          })
        })()
      }}
      isPending={isMutating}
    >
      {buttonText}
    </Button>
  )
}
