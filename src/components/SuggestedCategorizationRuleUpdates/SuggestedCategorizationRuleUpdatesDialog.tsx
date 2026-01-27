import { useCallback } from 'react'

import { type UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { Drawer, Modal } from '@ui/Modal/Modal'
import { ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { RuleSuggestionHeader, SuggestedCategorizationRuleUpdates } from '@components/SuggestedCategorizationRuleUpdates/SuggestedCategorizationRuleUpdates'

type SuggestedCategorizationRuleUpdatesDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  ruleSuggestion?: UpdateCategorizationRulesSuggestion | null
  variant: 'modal' | 'drawer'
}

type SuggestedCategorizationRuleUpdatesDialogHeaderProps = {
  close: () => void
  ruleSuggestion?: UpdateCategorizationRulesSuggestion | null
}
const SuggestedCategorizationRuleUpdatesDialogHeader = ({ close, ruleSuggestion }: SuggestedCategorizationRuleUpdatesDialogHeaderProps) => {
  if (!ruleSuggestion) return null
  return (
    <ModalTitleWithClose
      heading={<RuleSuggestionHeader ruleSuggestion={ruleSuggestion} />}
      onClose={close}
    />
  )
}

export const SuggestedCategorizationRuleUpdatesDialog = ({
  isOpen,
  onOpenChange,
  ruleSuggestion,
  variant,
}: SuggestedCategorizationRuleUpdatesDialogProps) => {
  const isDrawer = variant === 'drawer'

  const DrawerHeader = useCallback(({ close }: { close: () => void }) => {
    if (!ruleSuggestion) return null
    return <SuggestedCategorizationRuleUpdatesDialogHeader close={close} ruleSuggestion={ruleSuggestion} />
  }, [ruleSuggestion])

  if (!ruleSuggestion) return null

  if (isDrawer) {
    return (
      <Drawer
        flexBlock
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant='mobile-drawer'
        slots={{ Header: DrawerHeader }}
        isDismissable
      >
        {({ close }) => (
          <VStack pi='md'>
            <SuggestedCategorizationRuleUpdates ruleSuggestion={ruleSuggestion} close={close} isDrawer />
          </VStack>
        )}
      </Drawer>
    )
  }

  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} size='lg' aria-label='Update categorization rules'>
      {({ close }) => (
        <>
          <SuggestedCategorizationRuleUpdatesDialogHeader close={close} ruleSuggestion={ruleSuggestion} />
          <SuggestedCategorizationRuleUpdates close={close} ruleSuggestion={ruleSuggestion} />
        </>
      )}
    </Modal>
  )
}
