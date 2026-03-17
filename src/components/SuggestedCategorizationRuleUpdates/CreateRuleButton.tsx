import { useCallback } from 'react'
import { Schema } from 'effect/index'
import { useTranslation } from 'react-i18next'

import { type CreateCategorizationRule, CreateCategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { useCreateCategorizationRule } from '@hooks/api/businesses/[business-id]/categorization-rules/useCreateCategorizationRule'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Button, type ButtonProps } from '@ui/Button/Button'
import { useWizard } from '@components/Wizard/Wizard'

interface CreateRuleButtonProps {
  newRule: CreateCategorizationRule
  slotProps?: ButtonProps
}

export const CreateRuleButton = ({ newRule: ruleSuggestion, slotProps }: CreateRuleButtonProps) => {
  const { t } = useTranslation()
  const { next } = useWizard()
  const { trigger: createCategorizationRule, isMutating } = useCreateCategorizationRule()
  const { addToast } = useLayerContext()
  const handlePress = useCallback(() => {
    void (async () => {
      const encodedRule = Schema.encodeUnknownSync(CreateCategorizationRuleSchema)(ruleSuggestion)
      await createCategorizationRule(encodedRule).then(() => {
        void next()
      }).catch(() => {
        addToast({ content: t('categorizationRules:error.create_categorization_rule', 'Failed to create categorization rule'), type: 'error' })
      })
    })()
  }, [addToast, createCategorizationRule, next, ruleSuggestion, t])
  return (
    <Button
      onPress={handlePress}
      isPending={isMutating}
      {...slotProps}
    />
  )
}
