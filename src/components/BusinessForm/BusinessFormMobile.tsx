import { useCallback } from 'react'
import { GridList } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import './businessFormMobile.scss'

import { BusinessFormMobileItem, type BusinessFormMobileItemOption } from './BusinessFormMobileItem'

interface BusinessFormMobileProps {
  options: BusinessFormMobileItemOption[]
  selectedId?: string
  showDescriptions?: boolean
  onSelect: (option: BusinessFormMobileItemOption) => void
  readOnly?: boolean
}

export const BusinessFormMobile = ({
  options,
  selectedId,
  onSelect,
  readOnly,
}: BusinessFormMobileProps) => {
  const { t } = useTranslation()
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
      aria-label={t('bankTransactions:label.category', 'Category')}
      selectionMode='single'
      selectedKeys={selectedId ? new Set([selectedId]) : new Set()}
      onSelectionChange={handleSelectionChange}
      className='Layer__BusinessFormMobile'
    >
      {options.map(option => (
        <BusinessFormMobileItem
          key={option.value.value}
          option={option}
        />
      ))}
    </GridList>
  )
}
