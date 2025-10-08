import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Drawer } from '../ui/Modal/Modal'
import { VStack } from '../ui/Stack/Stack'
import { getHeaderForRule, SuggestedCategorizationRuleUpdates } from './SuggestedCategorizationRuleUpdates'

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
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange} variant='mobile-drawer' isDismissable>
      {({ close }) => (
        <VStack className='Layer__suggested-categorization-rule-updates-drawer'>
          {getHeaderForRule(ruleSuggestion)}
          <SuggestedCategorizationRuleUpdates ruleSuggestion={ruleSuggestion} close={close} />
        </VStack>
      )}
    </Drawer>
  )
}
