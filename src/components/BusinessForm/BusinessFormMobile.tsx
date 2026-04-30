import { useCallback } from 'react'
import { GridList } from 'react-aria-components'

import './businessFormMobile.scss'

import { BusinessFormMobileItem, type BusinessFormMobileItemOption, type BusinessFormOptionValue } from './BusinessFormMobileItem'

interface BusinessFormMobileProps<T extends BusinessFormOptionValue> {
  options: BusinessFormMobileItemOption<T>[]
  selectedId?: string
  showDescriptions?: boolean
  onSelect: (option: BusinessFormMobileItemOption<T>) => void
  readOnly?: boolean
  ariaLabel: string
}

export const BusinessFormMobile = <T extends BusinessFormOptionValue,>({
  options,
  selectedId,
  onSelect,
  readOnly,
  ariaLabel,
}: BusinessFormMobileProps<T>) => {
  const handleSelectionChange = useCallback((keys: Set<string | number> | 'all') => {
    if (keys === 'all') return
    if (readOnly) return

    const selectedKey = [...keys][0]
    const selectedOption = options.find(opt => opt.value.value === selectedKey)
    if (selectedOption) {
      onSelect(selectedOption)
    }
  }, [options, onSelect, readOnly])

  return (
    <GridList
      aria-label={ariaLabel}
      selectionMode='single'
      selectedKeys={selectedId ? new Set([selectedId]) : new Set()}
      onSelectionChange={handleSelectionChange}
      className='Layer__BusinessFormMobile'
    >
      {options.map(option => (
        <BusinessFormMobileItem<T>
          key={option.value.value}
          option={option}
        />
      ))}
    </GridList>
  )
}
