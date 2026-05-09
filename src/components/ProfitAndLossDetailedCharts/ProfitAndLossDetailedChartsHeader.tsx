import classNames from 'classnames'
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
  showCloseButton?: boolean
  showDatePicker?: boolean
  onClose: () => void
}

export const ProfitAndLossDetailedChartsHeader = ({
  title,
  date,
  mode,
  showCloseButton = true,
  showDatePicker = false,
  onClose,
}: ProfitAndLossDetailedChartsHeaderProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const isTablet = mode === 'tablet'

  const HeaderTitle = () => (
    <VStack className='Layer__ProfitAndLossDetailedChartsHeader__head'>
      <Span
        size='lg'
        weight='bold'
        className={isTablet ? 'Layer__ProfitAndLossDetailedChartsHeader__title' : undefined}
      >
        {title}
      </Span>
      <Span
        size='sm'
        variant={isTablet ? undefined : 'subtle'}
        className='Layer__ProfitAndLossDetailedChartsHeader__date'
      >
        {formatDate(date, DateFormat.MonthYear)}
      </Span>
      {!isTablet && showDatePicker && <GlobalMonthPicker />}
    </VStack>
  )

  const CloseButton = () => {
    if (!showCloseButton) return null

    if (isTablet) {
      return <BackButton onClick={onClose} />
    }

    return (
      <Button
        icon
        inset
        variant='outlined'
        onPress={onClose}
        aria-label={t('common:action.close', 'Close')}
      >
        <XIcon />
      </Button>
    )
  }

  return (
    <header
      className={classNames(
        'Layer__ProfitAndLossDetailedChartsHeader',
        `Layer__ProfitAndLossDetailedChartsHeader--${mode}`,
      )}
    >
      {isTablet && <CloseButton />}
      <HeaderTitle />
      {!isTablet && <CloseButton />}
    </header>
  )
}
