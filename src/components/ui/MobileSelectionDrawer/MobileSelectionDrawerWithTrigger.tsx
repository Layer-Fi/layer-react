import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import type {
  ComboBoxOption,
  OptionsOrGroups,
  SingleSelectComboBoxProps,
} from '@ui/ComboBox/types'
import { filterOptionsOrGroups } from '@ui/MobileSelectionDrawer/filterUtils'
import { MobileSelectionDrawerList } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerList'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { SearchField } from '@components/SearchField/SearchField'

import './mobileSelectionDrawerWithTrigger.scss'

export type MobileSelectionDrawerWithTriggerProps<T extends ComboBoxOption> =
  Omit<SingleSelectComboBoxProps<T>, 'slots'>
  & {
    ariaLabel: string
    heading: string
    searchPlaceholder?: string
    slotProps?: {
      Trigger?: {
        placeholder?: string
        icon?: React.ReactNode
      }
    }
  }

export const MobileSelectionDrawerWithTrigger = <T extends ComboBoxOption>({
  ariaLabel,
  heading,
  selectedValue,
  onSelectedValueChange,
  isLoading = false,
  isError = false,
  isDisabled = false,
  isSearchable = false,
  searchPlaceholder,
  slotProps,
  ...optionOrGroups
}: MobileSelectionDrawerWithTriggerProps<T>) => {
  const { t } = useTranslation()
  const { options, groups } = optionOrGroups as Partial<OptionsOrGroups<T>>

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isOpen) setSearchQuery('')
  }, [isOpen])

  const openDrawer = useCallback(() => setIsOpen(true), [])

  const resolvedPlaceholder = slotProps?.Trigger?.placeholder ?? t('common:action.select_label', 'Select...')
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('common:action.search_label', 'Search')

  const filteredOptionsOrGroups = useMemo<OptionsOrGroups<T>>(
    () => filterOptionsOrGroups(
      (groups ? { groups } : { options: options ?? [] }) as OptionsOrGroups<T>,
      searchQuery.trim().toLowerCase(),
    ),
    [options, groups, searchQuery],
  )

  const Header = useCallback(() => (
    <ModalTitleWithClose
      heading={<ModalHeading size='md' weight='bold'>{heading}</ModalHeading>}
      hideCloseButton
      hideBottomPadding
    />
  ), [heading])

  return (
    <>
      <Button onClick={openDrawer} variant='outlined' isDisabled={isDisabled} flex fullWidth>
        <HStack
          fluid
          justify='space-between'
          className='Layer__MobileSelectionDrawerWithTrigger__Trigger'
        >
          <Span size='sm' ellipsis>
            {selectedValue?.label ?? resolvedPlaceholder}
          </Span>
          {slotProps?.Trigger?.icon ?? <ChevronDown size={16} />}
        </HStack>
      </Button>

      <Drawer
        slots={{ Header }}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        variant='mobile-drawer'
        fixedHeight
        isDismissable
      >
        {({ close }) => (
          <VStack className='Layer__MobileSelectionDrawerWithTrigger__Drawer' pi='sm' pb='xs' gap='md'>
            {isSearchable && (
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                label={resolvedSearchPlaceholder}
              />
            )}
            <MobileSelectionDrawerList<T>
              ariaLabel={ariaLabel}
              {...filteredOptionsOrGroups}
              selectedValue={selectedValue}
              onSelectedValueChange={(value) => {
                onSelectedValueChange(value)
                close()
              }}
              isLoading={isLoading}
              isError={isError}
            />
          </VStack>
        )}
      </Drawer>
    </>
  )
}
