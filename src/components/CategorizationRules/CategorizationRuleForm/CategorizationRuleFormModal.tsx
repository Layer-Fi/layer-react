import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { Modal } from '@ui/Modal/Modal'
import { ModalActions, ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { CategorizationRuleFormFields } from '@components/CategorizationRules/CategorizationRuleForm/CategorizationRuleFormFields'
import { type CategorizationRuleFormState } from '@components/CategorizationRules/CategorizationRuleForm/formUtils'
import { useCategorizationRuleForm } from '@components/CategorizationRules/CategorizationRuleForm/useCategorizationRuleForm'

type CategorizationRuleFormModalBodyProps = {
  formState: CategorizationRuleFormState
  onSuccess: (rule: CategorizationRule) => void
  onClose: () => void
}

const CategorizationRuleFormModalBody = ({ formState, onSuccess, onClose }: CategorizationRuleFormModalBodyProps) => {
  const { t } = useTranslation()
  const { form, submitError } = useCategorizationRuleForm({ formState, onSuccess })

  return (
    <>
      <ModalContent>
        <CategorizationRuleFormFields form={form} formState={formState} />
      </ModalContent>
      <ModalActions>
        <HStack gap='sm'>
          <Spacer />
          <Button variant='outlined' onPress={onClose}>
            {t('common:action.cancel_label', 'Cancel')}
          </Button>
          <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <SubmitButton
                onPress={() => { void form.handleSubmit() }}
                isDisabled={!canSubmit}
                isPending={isSubmitting}
                isError={!!submitError}
                errorMessage={submitError}
                withRetry
                noIcon
              >
                {submitError
                  ? t('common:action.retry_label', 'Retry')
                  : formState.mode === 'edit'
                    ? t('categorizationRules:action.save_rule', 'Save Rule')
                    : t('categorizationRules:action.create_rule', 'Create Rule')}
              </SubmitButton>
            )}
          </form.Subscribe>
        </HStack>
      </ModalActions>
    </>
  )
}

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
          <CategorizationRuleFormModalBody
            formState={activeFormState}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        )}
      </VStack>
    </Modal>
  )
}
