import { useCallback } from 'react'

import { type UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { Drawer, Modal } from '@ui/Modal/Modal'
import { ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { Separator } from '@components/Separator/Separator'
import { RuleSuggestionHeader, SuggestedCategorizationRuleUpdates } from '@components/SuggestedCategorizationRuleUpdates/SuggestedCategorizationRuleUpdates'

type SuggestedCategorizationRuleUpdatesDialogProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  ruleSuggestion?: UpdateCategorizationRulesSuggestion | null
  variant: 'modal' | 'drawer'
}

type SuggestedCategorizationRuleUpdatesDialogDesktopHeaderProps = {
  close: () => void
  ruleSuggestion?: UpdateCategorizationRulesSuggestion | null
}

type SuggestedCategorizationRuleUpdatesDialogDrawerHeaderProps = {
  ruleSuggestion?: UpdateCategorizationRulesSuggestion | null
}

const SuggestedCategorizationRuleUpdatesDialogDesktopHeader = ({ close, ruleSuggestion }: SuggestedCategorizationRuleUpdatesDialogDesktopHeaderProps) => {
  if (!ruleSuggestion) return null

  return (
    <VStack>
      <ModalTitleWithClose
        heading={<RuleSuggestionHeader ruleSuggestion={ruleSuggestion} />}
        onClose={close}
      />
    </VStack>
  )
}

const SuggestedCategorizationRuleUpdatesDialogDrawerHeader = ({ ruleSuggestion }: SuggestedCategorizationRuleUpdatesDialogDrawerHeaderProps) => {
  if (!ruleSuggestion) return null

  return (
    <VStack pbe='sm' gap='xs'>
      <RuleSuggestionHeader ruleSuggestion={ruleSuggestion} />
      <Separator />
    </VStack>
  )
}

export const SuggestedCategorizationRuleUpdatesDialog = ({
  isOpen,
  onOpenChange,
  ruleSuggestion,
  variant,
}: SuggestedCategorizationRuleUpdatesDialogProps) => {
  const isDrawer = variant === 'drawer'

  const DrawerHeader = useCallback(() => {
    if (!ruleSuggestion) return null
    return <SuggestedCategorizationRuleUpdatesDialogDrawerHeader ruleSuggestion={ruleSuggestion} />
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
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} aria-label='Update categorization rules'>
      {({ close }) => (
        <>
          <SuggestedCategorizationRuleUpdatesDialogDesktopHeader close={close} ruleSuggestion={ruleSuggestion} />
          <SuggestedCategorizationRuleUpdates close={close} ruleSuggestion={ruleSuggestion} />
        </>
      )}
    </Modal>
  )
}
