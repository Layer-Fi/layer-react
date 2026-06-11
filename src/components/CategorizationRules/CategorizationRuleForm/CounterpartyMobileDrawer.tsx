import { useCallback, useId, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BankTransactionCounterparty } from '@schemas/bankTransactions/base'
import { Button } from '@ui/Button/Button'
import { MobileSelectionDrawerList } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerList'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { type CounterpartyComboBoxOption } from '@components/CategorizationRules/CategorizationRuleForm/counterpartyComboBoxOption'
import { useCounterpartyOptions } from '@components/CategorizationRules/CategorizationRuleForm/useCounterpartyOptions'
import { SearchField } from '@components/SearchField/SearchField'

type CounterpartyMobileDrawerProps = {
  label: string
  value: BankTransactionCounterparty | null
  onValueChange: (counterparty: BankTransactionCounterparty | null) => void
  showLabel?: boolean
  isReadOnly?: boolean
  placeholder?: string
}

export const CounterpartyMobileDrawer = ({
  label,
  value,
  onValueChange,
  showLabel,
  isReadOnly,
  placeholder,
}: CounterpartyMobileDrawerProps) => {
  const { t } = useTranslation()
  const inputId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const {
    inputValue,
    handleInputChange,
    options,
    selectedOption,
    isLoading,
    isError: isListError,
  } = useCounterpartyOptions(value)

  const Header = useCallback(() => (
    <ModalTitleWithClose
      heading={<ModalHeading size='md' weight='bold'>{label}</ModalHeading>}
      hideCloseButton
      hideBottomPadding
    />
  ), [label])

  const drawerSlots = useMemo(() => ({ Header }), [Header])

  const openDrawer = useCallback(() => setIsOpen(true), [])

  const triggerLabel = selectedOption?.label
    ?? placeholder
    ?? t('common:action.select_label', 'Select…')

  return (
    <VStack gap='3xs'>
      {showLabel && (
        <Label size='sm' htmlFor={inputId}>
          {label}
        </Label>
      )}
      <Button
        id={inputId}
        onPress={openDrawer}
        variant='outlined'
        isDisabled={isReadOnly}
        fullWidth
        flex
        aria-label={label}
      >
        <HStack fluid justify='space-between' align='center'>
          <Span size='sm' ellipsis>{triggerLabel}</Span>
          {!isReadOnly && <ChevronDown size={16} />}
        </HStack>
      </Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        variant='mobile-drawer'
        fixedHeight
        isDismissable
        aria-label={label}
        slots={drawerSlots}
      >
        {({ close }) => (
          <VStack pi='sm' pb='xs' gap='md'>
            <SearchField
              value={inputValue}
              onChange={handleInputChange}
              label={t('common:action.search_label', 'Search')}
            />
            <MobileSelectionDrawerList<CounterpartyComboBoxOption>
              ariaLabel={label}
              options={options}
              selectedValue={selectedOption}
              onSelectedValueChange={(option) => {
                onValueChange(option?.original ?? null)
                close()
              }}
              isLoading={isLoading}
              isError={isListError}
            />
          </VStack>
        )}
      </Drawer>
    </VStack>
  )
}
