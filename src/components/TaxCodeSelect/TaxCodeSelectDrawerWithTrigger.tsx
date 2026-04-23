import { useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import ChevronDown from '@icons/ChevronDown'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { TaxCodeSelectDrawer, type TaxCodeSelectOption } from '@components/TaxCodeSelect/TaxCodeSelectDrawer'

import './taxCodeSelectDrawerWithTrigger.scss'

type Props = {
  options: TaxCodeSelectOption[]
  value: TaxCodeSelectOption | null | undefined
  onChange: (newValue: TaxCodeSelectOption | null) => void
  isDisabled?: boolean
  isClearable?: boolean
  className?: string
  placeholder?: string
}

export const TaxCodeSelectDrawerWithTrigger = ({
  options,
  value,
  onChange,
  isDisabled = false,
  isClearable = true,
  className,
  placeholder,
}: Props) => {
  const { t } = useTranslation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <HStack fluid className={classNames('Layer__TaxCodeSelectDrawerWithTrigger', className)}>
      <Button
        fullWidth
        aria-label={t('bankTransactions:action.select_tax_code', 'Select tax code')}
        onClick={() => {
          setIsDrawerOpen(true)
        }}
        variant='outlined'
        isDisabled={isDisabled}
      >
        <Span ellipsis variant={value ? undefined : 'placeholder'}>
          {value === undefined
            ? (placeholder ?? t('bankTransactions:action.select_tax_code', 'Select tax code'))
            : (value?.label ?? t('bankTransactions:action.no_tax_code', 'No tax code'))}
        </Span>
        <ChevronDown size={16} />
      </Button>

      <TaxCodeSelectDrawer
        options={options}
        onSelect={onChange}
        selectedId={value?.value}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        isClearable={isClearable}
      />
    </HStack>
  )
}
