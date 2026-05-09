<<<<<<< HEAD
=======
import classNames from 'classnames'
>>>>>>> main
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

<<<<<<< HEAD
=======
type HeaderTitleProps = {
  title: string
  dateLabel: string
  isTablet: boolean
  showDatePicker: boolean
}

const HeaderTitle = ({ title, dateLabel, isTablet, showDatePicker }: HeaderTitleProps) => (
  <VStack className='Layer__ProfitAndLossDetailedChartsHeader__head'>
    <Span size='lg' weight='bold'>
      {title}
    </Span>
    <Span
      size='sm'
      variant={isTablet ? undefined : 'subtle'}
      className='Layer__ProfitAndLossDetailedChartsHeader__date'
    >
      {dateLabel}
    </Span>
    {!isTablet && showDatePicker && <GlobalMonthPicker />}
  </VStack>
)

enum CloseButtonVariant {
  OutlinedIconButton = 'OutlinedIconButton',
  BackButton = 'BackButton',
}

type CloseButtonProps = {
  variant: CloseButtonVariant
  onClose: () => void
  ariaLabel: string
}
const CloseButton = ({ variant, onClose, ariaLabel }: CloseButtonProps) => {
  if (variant === CloseButtonVariant.BackButton) {
    return <BackButton onClick={onClose} aria-label={ariaLabel} />
  }

  return (
    <Button
      icon
      inset
      variant='outlined'
      onPress={onClose}
      aria-label={ariaLabel}
    >
      <XIcon />
    </Button>
  )
}

>>>>>>> main
type ProfitAndLossDetailedChartsHeaderProps = {
  title: string
  date: Date
  mode: 'desktop' | 'tablet'
<<<<<<< HEAD
  visible?: boolean
=======
>>>>>>> main
  showCloseButton?: boolean
  showDatePicker?: boolean
  onClose: () => void
}

export const ProfitAndLossDetailedChartsHeader = ({
  title,
  date,
  mode,
<<<<<<< HEAD
  visible = true,
=======
>>>>>>> main
  showCloseButton = true,
  showDatePicker = false,
  onClose,
}: ProfitAndLossDetailedChartsHeaderProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
<<<<<<< HEAD

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
=======
  const isTablet = mode === 'tablet'

  const headerProps: HeaderTitleProps = {
    title,
    isTablet,
    showDatePicker,
    dateLabel: formatDate(date, DateFormat.MonthYear),
  }

  const closeButtonProps: CloseButtonProps = {
    variant: isTablet ? CloseButtonVariant.BackButton : CloseButtonVariant.OutlinedIconButton,
    onClose,
    ariaLabel: t('common:action.close', 'Close'),
  }

  return (
    <header
      className={classNames(
        'Layer__ProfitAndLossDetailedChartsHeader',
        `Layer__ProfitAndLossDetailedChartsHeader--${mode}`,
      )}
    >
      {isTablet && showCloseButton && <CloseButton {...closeButtonProps} />}
      <HeaderTitle {...headerProps} />
      {!isTablet && showCloseButton && <CloseButton {...closeButtonProps} />}
>>>>>>> main
    </header>
  )
}
