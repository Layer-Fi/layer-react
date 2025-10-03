import { Modal, ModalProps } from '../../ui/Modal/Modal'
import { ModalCloseButton } from '../../ui/Modal/ModalSlots'
import { SuggestedCategorizationRuleUpdates } from '../../SuggestedCategorizationRuleUpdates/SuggestedCategorizationRuleUpdates'
import { UpdateCategorizationRulesSuggestion } from '../../../schemas/bankTransactions/categorizationRules/categorizationRule'

function SuggestedCategorizationRuleUpdatesModalContent({ close, ruleSuggestion }:
{ close: () => void, ruleSuggestion: UpdateCategorizationRulesSuggestion }) {
  return (
    <>
      <ModalCloseButton onClose={close} positionAbsolute />
      <SuggestedCategorizationRuleUpdates close={close} ruleSuggestion={ruleSuggestion} />
    </>
  )
}

type SuggestedCategorizationRuleUpdatesModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  ruleSuggestion: UpdateCategorizationRulesSuggestion
}
export function SuggestedCategorizationRuleUpdatesModal({
  isOpen,
  onOpenChange,
  ruleSuggestion,
}: SuggestedCategorizationRuleUpdatesModalProps) {
  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} size='lg' aria-label='Update categorization rules'>
      {({ close }) => <SuggestedCategorizationRuleUpdatesModalContent close={close} ruleSuggestion={ruleSuggestion} />}
    </Modal>
  )
}
