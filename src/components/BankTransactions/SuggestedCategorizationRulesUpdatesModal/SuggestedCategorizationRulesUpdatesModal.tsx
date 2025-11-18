import { type UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { Modal, type ModalProps } from '@ui/Modal/Modal'
import { ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { RuleSuggestionHeader, SuggestedCategorizationRuleUpdates } from '@components/SuggestedCategorizationRuleUpdates/SuggestedCategorizationRuleUpdates'

function SuggestedCategorizationRuleUpdatesModalContent({ close, ruleSuggestion }:
{ close: () => void, ruleSuggestion: UpdateCategorizationRulesSuggestion }) {
  return (
    <>
      <ModalTitleWithClose onClose={close} heading={<RuleSuggestionHeader ruleSuggestion={ruleSuggestion} />} />
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
