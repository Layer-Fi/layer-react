import { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
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
  const { isMobile } = useSizeClass()

  const lastFormStateRef = useRef(formState)
  if (formState) {
    lastFormStateRef.current = formState
  }
  const activeFormState = formState ?? lastFormStateRef.current

  const title = activeFormState?.mode === 'edit'
    ? t('categorizationRules:action.edit_rule', 'Edit Rule')
    : t('categorizationRules:action.create_rule', 'Create Rule')

  const Header = useCallback(({ close }: { close: () => void }) => (
    <CategorizationRuleFormDrawerHeader title={title} close={close} />
  ), [title])

  const slots = useMemo(() => ({ Header }), [Header])

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      aria-label={title}
      variant={isMobile ? 'mobile-drawer' : 'drawer'}
      flexBlock={isMobile}
      slots={slots}
    >
      {activeFormState && (
        <VStack pbe='lg' pi='md'>
          <CategorizationRuleForm formState={activeFormState} onSuccess={onSuccess} />
        </VStack>
      )}
    </Drawer>
  )
}
