import { useCallback } from 'react'
import { Schema } from 'effect/index'

import { type CreateCategorizationRule, CreateCategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { useCreateCategorizationRule } from '@hooks/useCategorizationRules/useCreateCategorizationRule'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Button } from '@ui/Button/Button'
import { useWizard } from '@components/Wizard/Wizard'

interface CreateRuleButtonProps {
  newRule: CreateCategorizationRule
  buttonText: string
}

export const CreateRuleButton = ({ newRule: ruleSuggestion, buttonText }: CreateRuleButtonProps) => {
  const { next } = useWizard()
  const { trigger: createCategorizationRule, isMutating } = useCreateCategorizationRule()
  const { addToast } = useLayerContext()
  const handlePress = useCallback(() => {
    void (async () => {
      const encodedRule = Schema.encodeUnknownSync(CreateCategorizationRuleSchema)(ruleSuggestion)
      await createCategorizationRule(encodedRule).then(() => {
        void next()
      }).catch(() => {
        addToast({ content: 'Failed to create categorization rule', type: 'error' })
      })
    })()
  }, [addToast, createCategorizationRule, next, ruleSuggestion])
  return (
    <Button
      onPress={handlePress}
      isPending={isMutating}
    >
      {buttonText}
    </Button>
  )
}
