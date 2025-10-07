import { useState } from 'react'
import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Button } from '../Button/Button'
import { useWizard } from '../Wizard/Wizard'
import { CheckboxWithTooltip } from '../ui/Checkbox/Checkbox'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Label } from '../ui/Typography/Text'
import { Separator } from '../Separator/Separator'

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
            <CheckboxWithTooltip isSelected={dontAskAgain} onChange={(isSelected) => { setDontAskAgain(isSelected) }} />
          </HStack>
        </HStack>

        <Button
          onClick={() => {
            void next()
          }}
        >
          Yes
        </Button>
      </HStack>

    </VStack>
  )
}
