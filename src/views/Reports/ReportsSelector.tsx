import { type ChangeEvent, useState } from 'react'

import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import ChevronDown from '@icons/ChevronDown'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Toggle } from '@components/Toggle/Toggle'
import { Drawer } from '@components/ui/Modal/Modal'

type ReportType = 'profitAndLoss' | 'balanceSheet' | 'statementOfCashFlow'
type ReportOption = { value: ReportType, label: string }

export interface ReportsSelectorProps {
  options: ReportOption[]
  selected: ReportType
  onChange: (value: ReportType) => void
}

export const ReportsSelector = ({
  options,
  selected,
  onChange,
}: ReportsSelectorProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { value: view } = useSizeClass()

  const selectedOption = options.find(opt => opt.value === selected)

  if (view !== 'desktop') {
    return (
      <HStack>
        <button
          className='Layer__reports-selector'
          onClick={() => setIsDrawerOpen(true)}
          type='button'
        >
          <Span size='lg' weight='bold'>
            {selectedOption?.label}
          </Span>
          <ChevronDown size={20} className='Layer__reports-selector__chevron' />
        </button>

        <Drawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          variant='mobile-drawer'
          isDismissable
          aria-label='Select report type'
        >
          {({ close }) => (
            <VStack className='Layer__ReportsSelectorDrawer'>
              <HStack
                justify='center'
                pb='md'
              >
                <Span size='lg' weight='bold'>
                  Select Report
                </Span>
              </HStack>
              <VStack>
                {options.map((option) => {
                  const isSelected = option.value === selected
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChange(option.value)
                        close()
                      }}
                      type='button'
                    >
                      <Span size='md' weight={isSelected ? 'bold' : 'normal'}>
                        {option.label}
                      </Span>
                    </button>
                  )
                })}
              </VStack>
            </VStack>
          )}
        </Drawer>
      </HStack>
    )
  }

  return (
    <Toggle
      name='reports-tabs'
      options={options}
      selected={selected}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value as ReportType)}
    />
  )
}
