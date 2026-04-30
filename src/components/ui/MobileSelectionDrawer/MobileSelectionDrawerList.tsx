import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import CheckIcon from '@icons/Check'
import type {
  ComboBoxOption,
  OptionsOrGroups,
  SingleSelectComboBoxProps,
} from '@ui/ComboBox/types'
import { MobileList, type MobileListData } from '@ui/MobileList/MobileList'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './mobileSelectionDrawerList.scss'

export type MobileSelectionDrawerListProps<T extends ComboBoxOption> =
  Omit<
    SingleSelectComboBoxProps<T>,
    'slots' | 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'isDisabled'
  >
  & { ariaLabel: string }

type OptionItem<T extends ComboBoxOption> = {
  id: string
  option: T
}

const wrap = <T extends ComboBoxOption>(option: T): OptionItem<T> => ({
  id: option.value,
  option,
})

const EmptyState = () => {
  const { t } = useTranslation()
  return <Span size='sm'>{t('common:empty.results', 'No results found')}</Span>
}

const ErrorState = () => {
  const { t } = useTranslation()
  return <Span size='sm'>{t('common:error.something_went_wrong', 'Something went wrong')}</Span>
}

export const MobileSelectionDrawerList = <T extends ComboBoxOption>({
  ariaLabel,
  selectedValue,
  onSelectedValueChange,
  isLoading = false,
  isError = false,
  ...rest
}: MobileSelectionDrawerListProps<T>) => {
  const source = rest as OptionsOrGroups<T>

  const data = useMemo<MobileListData<OptionItem<T>> | undefined>(() => {
    if (source.groups) {
      return {
        groups: source.groups.map(group => ({
          label: group.label,
          items: group.options.map(wrap),
        })),
      }
    }
    return source.options ? source.options.map(wrap) : undefined
  }, [source.groups, source.options])

  const renderItem = useCallback(({ option }: OptionItem<T>) => {
    const isSelected = selectedValue?.value === option.value
    return (
      <HStack fluid pi='xs' align='center' justify='space-between' gap='sm'>
        <Span size='sm'>{option.label}</Span>
        <CheckIcon
          size={16}
          className='Layer__MobileSelectionDrawerList__Check'
          data-selected={isSelected}
        />
      </HStack>
    )
  }, [selectedValue])

  const onClickItem = useCallback(({ option }: OptionItem<T>) => {
    onSelectedValueChange(option)
  }, [onSelectedValueChange])

  return (
    <MobileList<OptionItem<T>>
      ariaLabel={ariaLabel}
      data={data}
      slots={{ EmptyState, ErrorState }}
      renderItem={renderItem}
      onClickItem={onClickItem}
      isLoading={isLoading}
      isError={isError}
      variant='compact'
    />
  )
}
