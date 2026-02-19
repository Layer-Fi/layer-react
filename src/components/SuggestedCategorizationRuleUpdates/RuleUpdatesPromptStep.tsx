import { useCallback } from 'react'

import { type UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { useRejectCategorizationRulesUpdateSuggestion } from '@hooks/useCategorizationRules/useRejectCategorizationRulesUpdateSuggestion'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Separator } from '@components/Separator/Separator'
import { CreateRuleButton } from '@components/SuggestedCategorizationRuleUpdates/CreateRuleButton'
import { useWizard } from '@components/Wizard/Wizard'

interface RuleUpdatesPromptStepProps {
  close: () => void
  ruleSuggestion: UpdateCategorizationRulesSuggestion
  isDrawer?: boolean
}

export function RuleUpdatesPromptStep({ ruleSuggestion, close, isDrawer }: RuleUpdatesPromptStepProps) {
  const { next } = useWizard()
  const { addToast } = useLayerContext()
  const { trigger: rejectRuleSuggestion, isMutating } = useRejectCategorizationRulesUpdateSuggestion()

  const handleDismissSuggestion = useCallback(() => {
    close()
  }, [close])

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
        addToast({ content: 'Failed to reject rule suggestion', type: 'error' })
      })
  },
  [addToast, close, rejectRuleSuggestion, ruleSuggestion.newRule.createdBySuggestionId])

  return (
    <VStack gap='md' pbe={isDrawer ? '3xl' : undefined}>
      <Span size='md'>{ruleSuggestion.suggestionPrompt}</Span>
      <VStack
        gap='sm'
      >
        {ruleSuggestion.transactionsThatWillBeAffected.length === 0
          ? (
            <CreateRuleButton
              newRule={ruleSuggestion.newRule}
              slotProps={{ fullWidth: true, children: 'Yes, always categorize' }}
            />
          )
          : (
            <Button onPress={() => void next()} fullWidth>
              Yes, always categorize
            </Button>
          )}
        <Button onPress={handleDismissSuggestion} variant='outlined' fullWidth>
          No, I&apos;ll decide each time
        </Button>
        <HStack align='center' gap='xs'>
          <Separator />
          <Span
            size='sm'
            variant='subtle'
          >
            OR
          </Span>
          <Separator />
        </HStack>
        <Button onPress={() => void handleDisableSuggestionPrompt()} isPending={isMutating} variant='outlined' fullWidth>
          Don&apos;t ask again
        </Button>
      </VStack>
    </VStack>
  )
}
