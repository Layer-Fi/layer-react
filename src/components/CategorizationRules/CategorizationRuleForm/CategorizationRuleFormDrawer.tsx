import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { CategorizationRuleForm } from '@components/CategorizationRules/CategorizationRuleForm/CategorizationRuleForm'
import { type CategorizationRuleFormState } from '@components/CategorizationRules/CategorizationRuleForm/formUtils'

export type CategorizationRuleFormDrawerProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSuccess: (rule: CategorizationRule) => void
  formState: CategorizationRuleFormState | null
}

const CategorizationRuleFormDrawerHeader = ({ title, close }: { title: string, close: () => void }) => (
  <ModalTitleWithClose
    heading={(
      <ModalHeading size='md'>
        {title}
      </ModalHeading>
    )}
    onClose={close}
  />
)

export const CategorizationRuleFormDrawer = ({
  isOpen,
  onOpenChange,
  onSuccess,
  formState,
}: CategorizationRuleFormDrawerProps) => {
  const { t } = useTranslation()

  const title = formState?.mode === 'edit'
    ? t('categorizationRules:action.edit_rule', 'Edit Rule')
    : t('categorizationRules:action.new_rule', 'New Rule')

  const Header = useCallback(({ close }: { close: () => void }) => (
    <CategorizationRuleFormDrawerHeader title={title} close={close} />
  ), [title])

  if (formState === null) return null

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      aria-label={title}
      slots={{ Header }}
    >
      <VStack pb='lg'>
        <VStack pi='md'>
          <CategorizationRuleForm formState={formState} onSuccess={onSuccess} />
        </VStack>
      </VStack>
    </Drawer>
  )
}
