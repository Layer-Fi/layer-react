import { useCallback } from 'react'
import { X } from 'lucide-react'

import { type UpdateCategorizationRulesSuggestion } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { Button } from '@ui/Button/Button'
import { Drawer, Modal } from '@ui/Modal/Modal'
import { ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { RuleSuggestionHeader, SuggestedCategorizationRuleUpdates } from '@components/SuggestedCategorizationRuleUpdates/SuggestedCategorizationRuleUpdates'

import './suggestedCategorizationRuleUpdatesDialog.scss'

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

const SuggestedCategorizationRuleUpdatesDialogDesktopHeader = ({ close, ruleSuggestion }: SuggestedCategorizationRuleUpdatesDialogHeaderProps) => {
  if (!ruleSuggestion) return null

  return (
    <VStack className='Layer__SuggestedCategorizationRuleUpdatesDialog__desktop-header'>
      <ModalTitleWithClose
        heading={<RuleSuggestionHeader ruleSuggestion={ruleSuggestion} />}
        onClose={close}
      />
    </VStack>
  )
}

const SuggestedCategorizationRuleUpdatesDialogDrawerHeader = ({ close, ruleSuggestion }: SuggestedCategorizationRuleUpdatesDialogHeaderProps) => {
  if (!ruleSuggestion) return null

  return (
    <HStack justify='space-between' align='start' className='Layer__SuggestedCategorizationRuleUpdatesDialog__header'>
      <RuleSuggestionHeader ruleSuggestion={ruleSuggestion} />
      <Button
        icon
        inset
        variant='ghost'
        onPress={close}
        aria-label='Close Modal'
      >
        <X size={20} />
      </Button>
    </HStack>
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
    return <SuggestedCategorizationRuleUpdatesDialogDrawerHeader close={close} ruleSuggestion={ruleSuggestion} />
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
          <SuggestedCategorizationRuleUpdatesDialogDesktopHeader close={close} ruleSuggestion={ruleSuggestion} />
          <SuggestedCategorizationRuleUpdates close={close} ruleSuggestion={ruleSuggestion} />
        </>
      )}
    </Modal>
  )
}
