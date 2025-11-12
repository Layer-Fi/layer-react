import { GridList } from 'react-aria-components'
import { BusinessFormMobileItem, BusinessFormMobileItemOption } from './BusinessFormMobileItem'
import { VStack } from '@components/ui/Stack/Stack'
import { Span } from '@components/ui/Typography/Text'
import './businessFormMobile.scss'
import { useCallback } from 'react'

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
  const handleSelectionChange = useCallback((keys: Set<string | number> | 'all') => {
    if (readOnly) return

    const selectedKey = [...keys][0]
    const selectedOption = options.find(opt => opt.value.value === selectedKey)
    if (selectedOption) {
      onSelect(selectedOption)
    }
  }, [options, onSelect, readOnly])

  return (
    <VStack gap='sm'>
      <Span size='sm' weight='bold'>
        Select Category
      </Span>
      <GridList
        aria-label='Select a category'
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
    </VStack>
  )
}
