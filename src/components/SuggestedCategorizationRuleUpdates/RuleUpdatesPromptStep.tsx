import { useCallback, useState } from 'react'

import { type UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { useRejectCategorizationRulesUpdateSuggestion } from '@hooks/useCategorizationRules/useRejectCategorizationRulesUpdateSuggestion'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Button } from '@ui/Button/Button'
import { CheckboxWithTooltip } from '@ui/Checkbox/Checkbox'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
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
  const [dontAskAgain, setDontAskAgain] = useState(false)
  const { trigger: rejectRuleSuggestion, isMutating } = useRejectCategorizationRulesUpdateSuggestion()
  const ActionButtonsStack = isDrawer ? VStack : HStack

  const handleRejectRuleSuggestion = useCallback(async () => {
    if (!dontAskAgain) {
      close()
      return
    }

    if (ruleSuggestion.newRule.createdBySuggestionId) {
      await rejectRuleSuggestion(ruleSuggestion.newRule.createdBySuggestionId)
        .then(() => {
          close()
        }).catch(() => {
          addToast({ content: 'Failed to reject rule suggestion', type: 'error' })
        })
    }
  },
  [addToast, close, dontAskAgain, rejectRuleSuggestion, ruleSuggestion.newRule.createdBySuggestionId])

  return (
    <VStack gap='xl' pbe={isDrawer ? '3xl' : undefined}>
      <Span size='md'>{ruleSuggestion.suggestionPrompt}</Span>
      <VStack gap='sm' align='end' fluid>
        <ActionButtonsStack gap='xs' justify='end' className={isDrawer ? 'Layer__suggested-categorization-rule-updates__buttons--mobile' : undefined}>
          <Button
            onClick={() => void handleRejectRuleSuggestion()}
            isPending={isMutating}
            variant='outlined'
            fullWidth={isDrawer}
          >
            No, I’ll decide each time
          </Button>
          {ruleSuggestion.transactionsThatWillBeAffected.length === 0
            ? (
              <CreateRuleButton
                newRule={ruleSuggestion.newRule}
                slotProps={{ fullWidth: isDrawer, children: 'Yes, always categorize' }}
              />
            )
            : (
              <Button onPress={() => void next()} fullWidth={isDrawer}>
                Yes, always categorize
              </Button>
            )}
        </ActionButtonsStack>
        <HStack gap='xs' justify='center'>
          <CheckboxWithTooltip
            id='dont_ask_again'
            isSelected={dontAskAgain}
            onChange={(isSelected) => { setDontAskAgain(isSelected) }}
          />
          <Label size='sm' htmlFor='dont_ask_again'>
            Don’t ask me about this again
          </Label>
        </HStack>
      </VStack>
    </VStack>
  )
}
