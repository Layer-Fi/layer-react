import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Modal } from '@ui/Modal/Modal'
import { ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { CategorizationRuleForm } from '@components/CategorizationRules/CategorizationRuleForm/CategorizationRuleForm'
import { type CategorizationRuleFormState } from '@components/CategorizationRules/CategorizationRuleForm/formUtils'

export type CategorizationRuleFormModalProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSuccess: (rule: CategorizationRule) => void
  formState: CategorizationRuleFormState | null
}

export const CategorizationRuleFormModal = ({
  isOpen,
  onOpenChange,
  onSuccess,
  formState,
}: CategorizationRuleFormModalProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()

  // Retain the last form state so the content does not blank out during the close animation.
  const lastFormStateRef = useRef(formState)
  if (formState) {
    lastFormStateRef.current = formState
  }
  const activeFormState = formState ?? lastFormStateRef.current

  const title = activeFormState?.mode === 'edit'
    ? t('categorizationRules:action.edit_rule', 'Edit Rule')
    : t('categorizationRules:action.create_rule', 'Create Rule')

  const onClose = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      aria-label={title}
      size='md'
      flexBlock
      variant={isMobile ? 'mobile-drawer' : 'center'}
    >
      <VStack pi={isMobile ? 'lg' : undefined} pb={isMobile ? 'lg' : undefined}>
        <ModalTitleWithClose
          heading={<ModalHeading size='md'>{title}</ModalHeading>}
          onClose={onClose}
        />
        {activeFormState && (
          <ModalContent>
            <CategorizationRuleForm formState={activeFormState} onSuccess={onSuccess} />
          </ModalContent>
        )}
      </VStack>
    </Modal>
  )
}
