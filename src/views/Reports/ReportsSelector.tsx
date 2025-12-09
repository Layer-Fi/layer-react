import { type ChangeEvent, useState } from 'react'
import classNames from 'classnames'

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

  if (view === 'mobile') {
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
            <VStack className='Layer__reports-selector-drawer'>
              <HStack
                justify='center'
                pb='md'
                className='Layer__reports-selector-drawer__header'
              >
                <Span size='lg' weight='bold'>
                  Select Report
                </Span>
              </HStack>
              <VStack className='Layer__reports-selector-drawer__options'>
                {options.map((option) => {
                  const isSelected = option.value === selected
                  const optionClassName = classNames(
                    'Layer__reports-selector-drawer__option',
                    {
                      'Layer__reports-selector-drawer__option--selected': isSelected,
                    },
                  )

                  return (
                    <button
                      key={option.value}
                      className={optionClassName}
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
