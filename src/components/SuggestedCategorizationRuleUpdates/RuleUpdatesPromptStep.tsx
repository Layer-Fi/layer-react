import { useState } from 'react'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Button } from '../../components/ui/Button/Button'
import { useWizard } from '../Wizard/Wizard'
import { CheckboxWithTooltip } from '../ui/Checkbox/Checkbox'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Label } from '../ui/Typography/Text'
import { Separator } from '../Separator/Separator'
import { CreateRuleButton } from './CreateRuleButton'

interface RuleUpdatesPromptStepProps {
  onClose: (dontAskAgain: boolean) => void
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export function RuleUpdatesPromptStep({ ruleSuggestion, onClose }: RuleUpdatesPromptStepProps) {
  const { next } = useWizard()
  const [dontAskAgain, setDontAskAgain] = useState(false)

  return (
    <VStack gap='lg'>
      {ruleSuggestion.suggestionPrompt}
      <Separator />
      <HStack justify='space-between'>
        <HStack gap='sm'>
          <Button
            onClick={() => {
              onClose(dontAskAgain)
            }}
          >
            No
          </Button>
          <HStack gap='3xs'>
            <Label size='sm' htmlFor='dont_ask_again'>
              Don&apos;t ask again
            </Label>
            <CheckboxWithTooltip id='dont_ask_again' isSelected={dontAskAgain} onChange={(isSelected) => { setDontAskAgain(isSelected) }} />
          </HStack>
        </HStack>
        {ruleSuggestion.transactionsThatWillBeAffected.length == 0
          ? (
            <CreateRuleButton
              newRule={ruleSuggestion.newRule}
              buttonText='Yes'
            />
          )
          : (
            <Button
              onClick={() => {
                void next()
              }}
            >
              Yes
            </Button>
          )}
      </HStack>

    </VStack>
  )
}
