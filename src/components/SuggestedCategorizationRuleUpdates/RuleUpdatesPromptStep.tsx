import { useState } from 'react'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Button } from '../../components/ui/Button/Button'
import { useWizard } from '../Wizard/Wizard'
import { CheckboxWithTooltip } from '../ui/Checkbox/Checkbox'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Label } from '../ui/Typography/Text'
import { Separator } from '../Separator/Separator'
import { CreateRuleButton } from './CreateRuleButton'
import { useRejectCategorizationRulesUpdateSuggestion } from '../../hooks/useCategorizationRules/useRejectCategorizationRulesUpdateSuggestion'
import { useLayerContext } from '../../contexts/LayerContext'

interface RuleUpdatesPromptStepProps {
  close: () => void
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export function RuleUpdatesPromptStep({ ruleSuggestion, close }: RuleUpdatesPromptStepProps) {
  const { next } = useWizard()
  const { addToast } = useLayerContext()
  const [dontAskAgain, setDontAskAgain] = useState(false)
  const { trigger: rejectRuleSuggestion, isMutating } = useRejectCategorizationRulesUpdateSuggestion()

  return (
    <VStack gap='lg'>
      {ruleSuggestion.suggestionPrompt}
      <Separator />
      <HStack gap='sm'>
        <Button
          onClick={() => {
            void (async () => {
              if (dontAskAgain) {
                if (ruleSuggestion.newRule.createdBySuggestionId) {
                  await rejectRuleSuggestion(ruleSuggestion.newRule.createdBySuggestionId)
                    .then(() => {
                      close()
                    }).catch(() => {
                      addToast({ content: 'Failed to reject rule suggestion', type: 'error' })
                    })
                }
              }
              else {
                close()
              }
            })()
          }}
          isPending={isMutating}
          variant='outlined'
        >
          No, I&apos;ll decide each time
        </Button>
        {ruleSuggestion.transactionsThatWillBeAffected.length == 0
          ? (
            <CreateRuleButton
              newRule={ruleSuggestion.newRule}
              buttonText='Yes, always categorize'
            />
          )
          : (
            <Button
              onPress={() => {
                void next()
              }}
            >
              Yes, always categorize
            </Button>
          )}
      </HStack>
      <HStack gap='3xs' justify='center'>
        <CheckboxWithTooltip id='dont_ask_again' isSelected={dontAskAgain} onChange={(isSelected) => { setDontAskAgain(isSelected) }} />
        <Label size='sm' htmlFor='dont_ask_again'>
          Don&apos;t ask me about this again
        </Label>
      </HStack>

    </VStack>
  )
}
