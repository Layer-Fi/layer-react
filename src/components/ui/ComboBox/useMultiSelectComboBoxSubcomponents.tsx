import { useMemo, useRef } from 'react'
import classNames from 'classnames'
import { Filter } from 'lucide-react'
import {
  components,
  type GroupBase,
  type MultiValueGenericProps,
  type MultiValueProps,
} from 'react-select'

import { COMBO_BOX_CLASS_NAMES } from '@ui/ComboBox/classnames'
import type { ComboBoxOption } from '@ui/ComboBox/types'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'

const getSelectedCount = <T extends ComboBoxOption>(selectedValues: T | readonly T[] | null | undefined): number => {
  if (!selectedValues) {
    return 0
  }

  if (Array.isArray(selectedValues)) {
    return selectedValues.length
  }

  return 1
}

const getSelectedLabels = <T extends ComboBoxOption>(selectedValues: T | readonly T[] | null | undefined): string => {
  if (!selectedValues) {
    return ''
  }

  if (Array.isArray(selectedValues)) {
    const labels = (selectedValues as T[]).map(v => v.label)
    return new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(labels)
  }

  return (selectedValues as T).label
}

const buildCustomMultiValue = <T extends ComboBoxOption>() => {
  return function CustomMultiValue({ children, ...restProps }: MultiValueProps<T, true, GroupBase<T>>) {
    const { index, selectProps } = restProps
    const isTyping = selectProps.inputValue && selectProps.inputValue.length > 0

    if (index > 0 || isTyping) {
      return null
    }

    return (
      <components.MultiValue {...restProps} className={COMBO_BOX_CLASS_NAMES.MULTI_VALUE}>
        {children}
      </components.MultiValue>
    )
  }
}

const buildCustomMultiValueLabel = <T extends ComboBoxOption>() => {
  return function CustomMultiValueLabel({ children, innerProps, ...restProps }: MultiValueGenericProps<T, true, GroupBase<T>>) {
    const selectedValues = restProps.selectProps.value
    const selectedCount = getSelectedCount(selectedValues)
    const selectedLabels = getSelectedLabels(selectedValues)

    const mergedInnerProps = {
      ...innerProps,
      className: classNames(innerProps?.className, COMBO_BOX_CLASS_NAMES.MULTI_VALUE_LABEL),
    }

    return (
      <components.MultiValueLabel {...restProps} innerProps={mergedInnerProps}>
        <HStack gap='3xs' align='center'>
          <Badge size={BadgeSize.SMALL} variant={BadgeVariant.INFO}>
            {selectedCount}
            <Filter size={12} />
          </Badge>
          <Span variant='inherit' withTooltip>{selectedLabels}</Span>
        </HStack>
      </components.MultiValueLabel>
    )
  }
}

const NullComponent = () => null

export const useMultiSelectComboBoxSubcomponents = <T extends ComboBoxOption>() => {
  const MultiValueRef = useRef(buildCustomMultiValue<T>())
  const MultiValueLabelRef = useRef(buildCustomMultiValueLabel<T>())

  return useMemo(() => ({
    MultiValue: MultiValueRef.current,
    MultiValueLabel: MultiValueLabelRef.current,
    MultiValueRemove: NullComponent,
  }), [])
}
