import { type UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { Drawer } from '@ui/Modal/Modal'
import { VStack } from '@ui/Stack/Stack'
import { RuleSuggestionHeader, SuggestedCategorizationRuleUpdates } from '@components/SuggestedCategorizationRuleUpdates/SuggestedCategorizationRuleUpdates'

interface SuggestedCategorizationRuleUpdatesDrawerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}

export const SuggestedCategorizationRuleUpdatesDrawer = ({
  isOpen,
  onOpenChange,
  ruleSuggestion,
}: SuggestedCategorizationRuleUpdatesDrawerProps) => {
  return (
    <Drawer flexBlock isOpen={isOpen} onOpenChange={onOpenChange} variant='mobile-drawer' isDismissable>
      {({ close }) => (
        <VStack pi='sm' pb='sm'>
          <RuleSuggestionHeader ruleSuggestion={ruleSuggestion} />
          <SuggestedCategorizationRuleUpdates ruleSuggestion={ruleSuggestion} close={close} isDrawer />
        </VStack>
      )}
    </Drawer>
  )
}
