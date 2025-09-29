import { UpdateCategorizationRulesSuggestion } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Drawer } from '../ui/Modal/Modal'
import { SuggestedCategorizationRuleUpdates } from './SuggestedCategorizationRuleUpdates'

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
        <SuggestedCategorizationRuleUpdates ruleSuggestion={ruleSuggestion} onComplete={close} />
      )}
    </Drawer>
  )
}
