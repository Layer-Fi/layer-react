import { XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BackButton } from '@components/Button/BackButton'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

import './profitAndLossDetailedChartsHeader.scss'

type ProfitAndLossDetailedChartsHeaderProps = {
  title: string
  date: Date
  mode: 'desktop' | 'tablet'
  visible?: boolean
  showCloseButton?: boolean
  showDatePicker?: boolean
  onClose: () => void
}

export const ProfitAndLossDetailedChartsHeader = ({
  title,
  date,
  mode,
  visible = true,
  showCloseButton = true,
  showDatePicker = false,
  onClose,
}: ProfitAndLossDetailedChartsHeaderProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()

  if (!visible) return null

  if (mode === 'tablet') {
    return (
      <header className='Layer__ProfitAndLossDetailedChartsHeader Layer__ProfitAndLossDetailedChartsHeader--tablet'>
        {showCloseButton && <BackButton onClick={onClose} />}
        <VStack className='Layer__ProfitAndLossDetailedChartsHeader__head'>
          <Span size='lg' weight='bold' className='Layer__ProfitAndLossDetailedChartsHeader__title'>{title}</Span>
          <Span size='sm' className='Layer__ProfitAndLossDetailedChartsHeader__date'>
            {formatDate(date, DateFormat.MonthYear)}
          </Span>
        </VStack>
      </header>
    )
  }

  return (
    <header className='Layer__ProfitAndLossDetailedChartsHeader Layer__ProfitAndLossDetailedChartsHeader--desktop'>
      <VStack className='Layer__ProfitAndLossDetailedChartsHeader__head'>
        <Span size='lg' weight='bold'>{title}</Span>
        <Span size='sm' variant='subtle' className='Layer__ProfitAndLossDetailedChartsHeader__date'>
          {formatDate(date, DateFormat.MonthYear)}
        </Span>
        {showDatePicker && <GlobalMonthPicker />}
      </VStack>
      {showCloseButton && (
        <Button icon inset variant='outlined' onPress={onClose} aria-label={t('common:action.close', 'Close')}>
          <XIcon />
        </Button>
      )}
    </header>
  )
}
