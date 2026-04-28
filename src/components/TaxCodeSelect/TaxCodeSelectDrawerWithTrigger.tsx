import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronDown from '@icons/ChevronDown'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { NO_TAX_CODE } from '@components/TaxCodeSelect/constants'
import { TaxCodeSelectDrawer, type TaxCodeSelectOption } from '@components/TaxCodeSelect/TaxCodeSelectDrawer'

type Props = {
  options: TaxCodeSelectOption[]
  value: TaxCodeSelectOption | null
  onChange: (newValue: TaxCodeSelectOption | null) => void
  isDisabled?: boolean
  hasSelection?: boolean
  className?: string
  placeholder?: string
}

export const TaxCodeSelectDrawerWithTrigger = ({
  options,
  value,
  onChange,
  isDisabled = false,
  hasSelection = true,
  className,
  placeholder,
}: Props) => {
  const { t } = useTranslation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <HStack fluid className={className}>
      <Button
        flex
        fullWidth
        aria-label={t('bankTransactions:action.select_tax_code', 'Select tax code')}
        onClick={() => {
          setIsDrawerOpen(true)
        }}
        variant='outlined'
        isDisabled={isDisabled}
      >
        <HStack fluid align='center' justify='space-between' gap='2xs'>
          <Span ellipsis variant={hasSelection ? undefined : 'placeholder'}>
            {!hasSelection
              ? (placeholder ?? t('bankTransactions:action.select_tax_code', 'Select tax code'))
              : (value?.label ?? t('bankTransactions:action.no_tax_code', 'No tax code'))}
          </Span>
          <ChevronDown size={16} />
        </HStack>
      </Button>

      <TaxCodeSelectDrawer
        options={options}
        onSelect={onChange}
        selectedId={value?.value ?? (hasSelection ? NO_TAX_CODE : undefined)}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </HStack>
  )
}
