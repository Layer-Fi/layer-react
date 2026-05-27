import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { CategorizationRuleForm } from '@components/CategorizationRules/CategorizationRuleForm/CategorizationRuleForm'
import { type CategorizationRuleFormState } from '@components/CategorizationRules/CategorizationRuleForm/formUtils'

type CategorizationRuleFormDrawerSharedProps = {
  onOpenChange: (isOpen: boolean) => void
  onSuccess: (rule: CategorizationRule) => void
}

export type CategorizationRuleFormDrawerProps = CategorizationRuleFormDrawerSharedProps & (
  | { isOpen: false, formState: null }
  | { isOpen: true, formState: CategorizationRuleFormState }
)

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
  const { isMobile } = useSizeClass()

  const title = formState?.mode === 'edit'
    ? t('categorizationRules:action.edit_rule', 'Edit Rule')
    : t('categorizationRules:action.new_rule', 'New Rule')

  const Header = useCallback(({ close }: { close: () => void }) => (
    <CategorizationRuleFormDrawerHeader title={title} close={close} />
  ), [title])

  if (!isOpen) return null

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      aria-label={title}
      variant={isMobile ? 'mobile-drawer' : 'drawer'}
      flexBlock={isMobile}
      slots={{ Header }}
    >
      <VStack pbe='lg' pi='md'>
        <CategorizationRuleForm formState={formState} onSuccess={onSuccess} />
      </VStack>
    </Drawer>
  )
}
