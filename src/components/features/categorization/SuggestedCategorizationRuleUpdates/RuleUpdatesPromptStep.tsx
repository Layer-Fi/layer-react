import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type UpdateCategorizationRulesSuggestion } from '@schemas/features/categorization/createCategorizationRule'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useRejectCategorizationRuleSuggestion } from '@api/businesses/[business-id]/categorization-rules/suggestions/[suggestion-id]/delete'
import { Button } from '@ui/Button/Button'
import { Separator } from '@ui/Separator/Separator'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { useWizard } from '@blocks/Wizard/Wizard'
import { CreateRuleButton } from '@features/categorization/SuggestedCategorizationRuleUpdates/CreateRuleButton'

interface RuleUpdatesPromptStepProps {
  close: () => void
  ruleSuggestion: UpdateCategorizationRulesSuggestion
  isDrawer?: boolean
}

export function RuleUpdatesPromptStep({ ruleSuggestion, close, isDrawer }: RuleUpdatesPromptStepProps) {
  const { t } = useTranslation()
  const { next } = useWizard()
  const { addToast } = useLayerContext()
  const { trigger: rejectRuleSuggestion, isMutating } = useRejectCategorizationRuleSuggestion()

  const handleDisableSuggestionPrompt = useCallback(async () => {
    const suggestionId = ruleSuggestion.newRule.createdBySuggestionId
    if (!suggestionId) {
      close()
      return
    }

    await rejectRuleSuggestion(suggestionId)
      .then(() => {
        close()
      }).catch(() => {
        addToast({ content: t('categorization:SuggestedCategorizationRuleUpdates.RuleUpdatesPromptStep.error.reject_rule_suggestion', 'Failed to reject rule suggestion'), type: 'error' })
      })
  },
  [addToast, close, rejectRuleSuggestion, ruleSuggestion.newRule.createdBySuggestionId, t])

  return (
    <VStack gap='md' pbe={isDrawer ? 'xl' : undefined}>
      <Span size='md'>{ruleSuggestion.suggestionPrompt}</Span>
      <VStack
        gap='sm'
      >
        {ruleSuggestion.transactionsThatWillBeAffected.length === 0
          ? (
            <CreateRuleButton
              newRule={ruleSuggestion.newRule}
              slotProps={{ fullWidth: true, children: t('categorization:SuggestedCategorizationRuleUpdates.RuleUpdatesPromptStep.action.yes_always_categorize', 'Yes, always categorize') }}
            />
          )
          : (
            <Button onPress={() => void next()} fullWidth>
              {t('categorization:SuggestedCategorizationRuleUpdates.RuleUpdatesPromptStep.action.yes_always_categorize', 'Yes, always categorize')}
            </Button>
          )}
        <Button onPress={close} variant='outlined' fullWidth>
          {t('categorization:SuggestedCategorizationRuleUpdates.RuleUpdatesPromptStep.action.no_decide_each_time', 'No, I’ll decide each time')}
        </Button>
        <HStack align='center' gap='xs'>
          <Separator />
          <Span
            size='sm'
            variant='subtle'
          >
            {t('categorization:SuggestedCategorizationRuleUpdates.RuleUpdatesPromptStep.label.or', 'OR')}
          </Span>
          <Separator />
        </HStack>
        <Button onPress={() => void handleDisableSuggestionPrompt()} isPending={isMutating} variant='outlined' fullWidth>
          {t('categorization:SuggestedCategorizationRuleUpdates.RuleUpdatesPromptStep.action.dont_ask_again', 'Don’t ask again')}
        </Button>
      </VStack>
    </VStack>
  )
}
